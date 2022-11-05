import { StyleSheet, Text, View, ScrollView, Image, Pressable, Linking } from 'react-native'
import { useState } from 'react'

export default function ScrollableNews(params) { // this component renders the scrollable news area and individual news when opened by user

  const [currentArticle, setCurrentArticle] = useState(null) // store individual article's structure (null means no individual article is rendered)

  const changeArticleState = (value) => {
    setCurrentArticle(value)
  }

  return (
    <ScrollView>
      { currentArticle? // if user clicks an article from the scrollable articles that article data is saved in component state and the individual article will be displayed
        <View style={stylesForNews.articleContainer}>
          <Text onPress={() =>  changeArticleState(null)} style={stylesForNews.articleCloseBtn}>Close article</Text>
          <Text style={stylesForNews.articleTitle}>{currentArticle.title}</Text>
          <Image style={stylesForNews.articleImage} source={{ uri: currentArticle.urlToImage }}/>
          <Text style={stylesForNews.articlePublisher}>{currentArticle.source.name}</Text>
          <Text style={stylesForNews.articleContent}>{currentArticle.content}</Text>
          <Text style={stylesForNews.articleLink} onPress={() => Linking.openURL(currentArticle.url)}>
            <Text style={stylesForNews.articleLinkBasic}>Read full article at </Text>{currentArticle.url}
          </Text>
        </View> :
        params.params.articles && params.params.articles.map((item, index) => { // if user hasn't opened an individual article and component has received news data through props, then render scrollable news
          return(
            <Pressable style={stylesForNews.newsContainer} key={index} onPress={() => changeArticleState(item)}>
              <View style={stylesForNews.newsInnerContainer}>
                <Text style={stylesForNews.newsTitle}>{item.title}</Text>
                <Text style={stylesForNews.publisher}>{item.source.name}</Text>
              </View>
              <View style={stylesForNews.newsImageContainer}>
                <Image style={stylesForNews.newsImage} source={{ uri: item.urlToImage }}/>
              </View>
            </Pressable>
          )
        })
      }
    </ScrollView>
  )
}

const stylesForNews = StyleSheet.create({
  newsContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    padding: 10,
    marginTop: 20,
    backgroundColor: 'white',
  },
  newsInnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '65%',
    justifyContent: 'space-between',
  },
  newsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    paddingRight: 8,
    marginBottom: 25,
  },
  newsImageContainer: {
    display: 'flex',
    alignItems: 'center',
    height: 80,
    width: '35%',
  },
  newsImage: {
    height: '100%',
    width: '100%',
  },
  articleContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    padding: 20,
  },
  articleTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    paddingRight: 8,
    marginBottom: 25,
  },
  articleImage: {
    height: 200,
    width: '100%',
  },
  articleContent: {
    fontSize: 17,
    marginTop: 25,
  },
  articleLink: {
    fontSize: 17,
    marginTop: 70,
    color: 'blue'
  },
  articleLinkBasic: {
    color: 'black'
  },
  articlePublisher: {
    textAlign: 'right'
  },
  articleCloseBtn: {
    marginBottom: 20,
    fontSize: 20,
    textAlign: 'right',
    color: '#072b63',
  }
});
