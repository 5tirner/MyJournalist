from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.conf import settings
import asyncio
from datetime import datetime
import requests
import random, string
import twikit
import os
from .models import conversations

os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"

async def get_tweets(searchFor, cookies, identity):
    FOOTBALL_TRUSTED_ACCOUNTS = [
    "SkySportsNews", "BBCFootball", "ESPNFC", "goal", "FabrizioRomano",
    "premierleague", "ChampionsLeague", "FIFAcom"
    ]
    IT_TRUSTED_ACCOUNTS = [
        "TechCrunch", "WIRED", "CNET", "TheVerge", "ZDNet",
        "Microsoft", "Google", "IBM"
    ]
    CYBERSECURITY_TRUSTED_ACCOUNTS = [
        "BrianKrebs", "CyberScoopNews", "DarkReading", "Threatpost",
        "NCSC", "CISAcyber", "SANSInstitute", "MalwareTechBlog"
    ]
    CRYPTO_TRUSTED_ACCOUNTS = [
        "CoinDesk", "Cointelegraph", "CryptoSlate", "krakenfx",
        "binance", "VitalikButerin", "Blockchain", "MessariCrypto"
    ]
    POLITICS_TRUSTED_ACCOUNTS = [
        "BBCNews", "CNNPolitics", "Reuters", "AP_Politics",
        "politico", "guardiannews", "nytimes", "AFP"
    ]
    AI_TRUSTED_ACCOUNTS = [
        "MIT_CSAIL", "DeepMind", "OpenAI", "GoogleAI",
        "AI_Safety", "AndrewYNg", "NvidiaAI", "StanfordAI"
    ]
    FIELD_CONFIG = {
        "Football": (FOOTBALL_TRUSTED_ACCOUNTS, "breaking OR news OR result OR goal OR transfer OR match OR injury OR signing"),
        "Information technology": (IT_TRUSTED_ACCOUNTS, "tech OR innovation OR software OR hardware OR IT OR update"),
        "Cybersecurity": (CYBERSECURITY_TRUSTED_ACCOUNTS, "cybersecurity OR hack OR breach OR security OR threat OR update"),
        "Crypto": (CRYPTO_TRUSTED_ACCOUNTS, "crypto OR bitcoin OR ethereum OR blockchain OR market OR update"),
        "Politics": (POLITICS_TRUSTED_ACCOUNTS, "politics OR election OR government OR policy OR breaking OR news"),
        "Artificial intelligence": (AI_TRUSTED_ACCOUNTS, "AI OR artificialintelligence OR machinelearning OR research OR update")
    }
    client = twikit.Client(language='en-US')
    try:
        client.set_cookies(cookies)
    except Exception as e:
        print(f"Failed to load cookies: {e}")
        return None
    try:
        trusted_accounts, keywords = FIELD_CONFIG.get(searchFor, (FOOTBALL_TRUSTED_ACCOUNTS, "breaking OR news OR result"))
        query = " OR ".join([f"from:{account}" for account in trusted_accounts]) + f" ({keywords}) -filter:retweets"
        tweets = await client.search_tweet(query=query, product='Top', count=10)
        print(f"Fetched {len(tweets)} tweets.")
    except Exception as e:
        print(f"Error fetching tweets: {e}")
        return None
    print("Tweets Matched:")
    AllTweets = []
    conv_id = "conversations" + ''.join(random.choices(string.digits, k=10))
    for tweet in tweets:
        tweet_time = datetime.strptime(tweet.created_at, '%a %b %d %H:%M:%S %z %Y')
        AllTweets.append({
            'formWhere': 'Twitter',
            'text': tweet.text,
            'username': tweet.user.screen_name,
            'likes': tweet.favorite_count,
            'created_at': tweet_time,
            'real_time': tweet.created_at,
            'conversation_id': conv_id
        })
    if len(AllTweets) > 0:
        AllTweets.sort(key=lambda x: x['created_at'], reverse=True)
        startConversation = conversations.objects.get(identity=identity)
        AllTweets[0].pop('created_at')
        startConversation.topics[conv_id] = {f"News 1": AllTweets[0]}
        startConversation.titles[conv_id] = {'title': AllTweets[0]['text'][0:10] + '...', 'notification': AllTweets[0]}
        startConversation.save()
        return AllTweets[0]
    return None

async def get_google_news(params, newsurl, identity):
    response = requests.get(newsurl, params=params)
    await asyncio.sleep(10)
    if response is None:
        return None
    if response.status_code == 200:
        articles = response.json()['articles']
        if len(articles) > 0:
            # print("We have Some Google Arcticles")
            article = articles[0]
            source = article['source']['name']
            author = article['author']
            title = article['title']
            subj = article['description']
            newsUrl = article['url']
            newsImage = article['urlToImage']
            publishDate = article['publishedAt']
            if author is None or newsUrl is None or source is None:
                print("Not Trusted")
            conv_id = "conversations" + ''.join(random.choices(string.digits, k=10))
            theRes = {
                'formWhere': 'NEWS',
                'source': source,
                'author': author,
                'title': title,
                'subj': subj,
                'newsUrl': newsUrl,
                'newsImage': newsImage,
                'publishDate': publishDate,
                'conversation_id': conv_id
            }
            startConversation = conversations.objects.get(identity=identity)
            startConversation.topics[conv_id] = {f"News 1": theRes}
            startConversation.titles[conv_id] = {'title': title + '...', 'notification': theRes}
            startConversation.save()
            return theRes
        else:
            return None
    else:
        print(f"{response.content}")
        return None

class lastNews(AsyncJsonWebsocketConsumer):
    cookies = {
            "auth_token": settings.AUTH_TOKEN,
            "ct0": settings.CT0,
        }
    todayCode = ''.join(random.choices(string.digits, k=10))
    fields = ['Football', "Information technology", "Cybersecurity", "Crypto", "Politics", "Artificial intelligence"]
    switchFields = {
        "Football": 'football',
        "Information technology": 'it',
        "Cybersecurity": 'cybersec', 
        "Crypto": 'crypto',
        "Politics": 'politic',
        "Artificial intelligence": 'ai',
    }
    newsapikey = settings.NEWS_API
    newsurl = settings.NEWS_URL
    delay = 180
    
    async def connect(self):
        print(f"The Fileds {self.scope.get('fields')}")
        try:
            workingFields = self.scope.get('fields')
            for field in self.switchFields.values():
                if field in workingFields:
                    print(f"Add his to the room of {field}")
                    await self.channel_layer.group_add(field+self.todayCode, self.channel_name)
            await self.accept()
            asyncio.create_task(self.sendNews(workingFields))
        except Exception as e:
            print(f"Error {e}")
    
    async def sendNews(self, workingFields):
        while True:
            for query in self.fields:
                code = self.switchFields.get(query)
                if code in workingFields:
                    newsFromTweets = await get_tweets(query, self.cookies, self.scope.get('identity'))
                    if newsFromTweets is not None:
                        try:
                            print(f"Send Tweets for {code}")
                            await self.channel_layer.group_send(code+self.todayCode, {"type": "toFront", "Data": newsFromTweets})
                            await asyncio.sleep(self.delay)
                        except Exception as e:
                            print(f"Error: {e}")
                    params = {'q': f"{query} News", 'language': 'en', 'sortBy': 'publishedAt', 'apiKey': self.newsapikey}
                    newsFromGoogling = await get_google_news(params, self.newsurl, self.scope.get('identity')) 
                    print(f"Send News for {code}")
                    if newsFromGoogling is not None:
                        try:
                            await self.channel_layer.group_send(
                                    code+self.todayCode, {"type": "toFront", "Data": newsFromGoogling}
                                )
                            await asyncio.sleep(self.delay)
                        except Exception as e:
                            print(f"Error: {e}")

    async def disconnect(self, code):
        try:
            print("Disconnect")
            await self.close()
        except:
            print("closing fail")
    
    async def toFront(self, data):
        print("Sending...")
        try:
            await self.send_json(data["Data"])
        except:
            pass
    