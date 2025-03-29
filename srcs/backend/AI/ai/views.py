from rest_framework import response, status, decorators
from zauth.views import is_auth_user
from .models import conversations
import google.generativeai as gemini
from django.conf import settings
import requests
import json
from datetime import datetime
from bs4 import BeautifulSoup
import requests
import time


def getGoogleTextHelp(question):
    API_KEY = settings.SEARCH_API_KEY
    SEARCH_ENGINE_ID = settings.SEARCH_ENGINE_ID
    url = settings.SEARCH_URL
    params = {
        "key": API_KEY,
        "cx": SEARCH_ENGINE_ID,
        "q": question,
        "sort": "date",
        "num":  5,
    }
    apiRes = requests.get(url, params=params)
    if apiRes.status_code == 200:
        results = apiRes.json()
        helper = []
        for item in results.get("items", []):
            try:
                page_response = requests.get(item['link'], timeout=20)
                if page_response.status_code == 200:
                    soup = BeautifulSoup(page_response.text, 'html.parser')
                    paragraphs = soup.find_all('p')
                    if paragraphs:
                        answer_text = "".join(p.get_text(strip=True) for p in paragraphs[:3])[:500]
                        helper.append(answer_text)
                else:
                    print(f"Failed to fetch content: Status {page_response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"Error fetching content: {e}")
        print(f'TEXT TO HEEEEEEEEEEEEEEEEELP ==> {helper}')
        return helper
    return None

@decorators.api_view(['POST'])
def chatbot(req):
    try:
        user_data = is_auth_user(req.headers.get('Access-Token'), req.headers.get('Refresh-Token'))
    except Exception as error:
        return response.Response({'Authentication': 'Permission Needed'},
                                 status=status.HTTP_404_NOT_FOUND)
    data = req.data
    question =  data.get('question')
    conv_id = data.get('conversation_id')
    gemini.configure(api_key=settings.GEMINI_API_KEY)

    aimodel = gemini.GenerativeModel(settings.GEMINI_MODEL)
    if question is None or conv_id is None:
        return response.Response({'question': 'Required Field', 'conversation_id': 'Required Field'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        userTopics = conversations.objects.get(identity=user_data.identity)
        conv = userTopics.topics.get(conv_id)
        print(conv)
        task1 = {
            'What Is this': 'There is a conversation between you and a client\n',
            'Conversation': f"\n\n{conv}\n\n",
            'Explanation': 'your messages appearing as: `News number: message content`, client message appearing as: `Client question number`: message content\n',
            'Step1': 'Analyze the conversation well to put youself in the context\n',
            'Step2': f'Analyze this question: {question}\n',
            'Target': f'Based On This Things regenrate the best question to search on Wikipidia and remember we are in {datetime.today().strftime('%m/%d/%Y')}\n',
            'Hint': f'Do not give me all the data in your answer, give me the question only\n',
        }
        # prompt = f"There is a conversation between you and a client: {conv}, your messages appearing as: `your message nbr: message content`\nanalyze this conversation well\nAfter that answer this question of this client: {question}\nsearch on web or do any thing you want the impotant is to answer the question, your free to make mistakes\nhowever if you see that the question is out of the conversation context don't generate any thing just inform me that the question is out of this conversation, go work and be samrt"
        print("Journalist Thinking1 of question...")
        aires1 = aimodel.generate_content(f"Following this:{json.dumps(task1)}")
        summary1 = aires1.text.strip()
        print("Good Question: ", summary1)
        help = getGoogleTextHelp(summary1)
        task2 = {
            'Creator Rules1': 'Your Name is Journalist',
            'Creator Rules2': 'Your Creator Is Zakaria Sabri A Software Engineer from Beni-Mellal, Morocco, Here is The github of zakaria: 5tirner',
            'What Is this': 'There is a conversation between you and a client\n',
            'Today Date': datetime.today().strftime('%m/%d/%Y'),
            'Conversation': f"\n\n{conv}\n\n",
            'Step1': 'Analyze the conversation well to put youself in the context\n',
            'Explanation': 'your messages appearing as: `News number: message content`, client message appearing as: `Client question number`: message content\n',
            'Step2': f'Analyze this question: {question}\n',
            'Step3': f'Analyze this helper article from google: {help}\nBut if the question is easy for you do not analyze them',
            'Target': f'Search on web and use the articles provided from google or do any thing to answer the question',
            'Rule1': 'Talk like you are talking this client for a while do not say `based on the conversation and the things like this`',
            'Nb': 'be smart and the most important thing is to give me the answer',
            'Answer Important Rule': 'Does Not include the client question or the news number or the question number from the conversation in your aswer',
        }
        print("Journalist Think of answer...")
        aires2 = aimodel.generate_content(f"Following this:{json.dumps(task2)}")
        summary2 = aires2.text.strip()
        lastIndex = len(conv.keys()) + 1
        conv.update({f"Client Question {lastIndex}": question})
        lastIndex += 1
        conv.update({f"News {lastIndex}": summary2})
        userTopics.save()
    except Exception as e:
        print(f"Error summarizing with Gemini: {e}")
        return  response.Response({'ai confused': 'AI failed to generate this content'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    time.sleep(3)
    return response.Response({'answer': summary2}, status=status.HTTP_200_OK)

# @decorators.api_view(['POST'])
# def add_conversation(req):
#     try:
#         user_data = is_auth_user(req.headers.get('Access-Token'), req.headers.get('Refresh-Token'))
#     except Exception as error:
#         return response.Response({'Authentication': 'Permission Needed'},
#                                  status=status.HTTP_404_NOT_FOUND)
#     conv_id = req.data.get('conversation_id')
#     message = req.data.get('message')
#     userTopics = conversations.objects.get(identity=user_data.identity)
#     if conv_id is None or message is None:
#         return response.Response({'conversation_id': 'required field', 'message': 'requirde field'}, status=status.HTTP_400_BAD_REQUEST)
#     theTopic = userTopics.topics.get(conv_id)
#     if theTopic is None:
#         print("New Topic")
#         userTopics.topics[conv_id] = {f"Your Message 1": message}
#     else:
#         print("Existance topic")
#         lastIndex = len(theTopic.keys()) + 1
#         theTopic.update({f"Client Message {lastIndex}": message})
#     userTopics.save()
#     print(userTopics)
#     return response.Response({'Topic': 'Updated'}, status=status.HTTP_200_OK)

@decorators.api_view(["POST"])
def get_convertation(req):
    try:
        user_data = is_auth_user(req.headers.get('Access-Token'), req.headers.get('Refresh-Token'))
    except Exception as error:
        return response.Response({'Authentication': 'Permission Needed'},
                                 status=status.HTTP_404_NOT_FOUND)
    conv_id = req.data.get('conversation_id')
    userTopics = conversations.objects.get(identity=user_data.identity)
    conv = userTopics.topics.get(conv_id)
    if conv is None:
        return response.Response({'conversation_id': 'Not Found'}, status=status.HTTP_400_BAD_REQUEST)
    return response.Response(conv, status=status.HTTP_200_OK)

@decorators.api_view(['GET'])
def getAllConversations(req):
    try:
        user_data = is_auth_user(req.headers.get('Access-Token'), req.headers.get('Refresh-Token'))
    except Exception as error:
        return response.Response({'Authentication': 'Permission Needed'},
                                 status=status.HTTP_404_NOT_FOUND)
    toSend:dict = {}
    convs = conversations.objects.get(identity=user_data.identity)
    return response.Response(convs.titles, status=status.HTTP_200_OK)
