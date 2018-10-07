import React, { PureComponent } from 'react'
import {
  Image,
  ImageStyle,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import {
  NavigationScreenProps,
  NavigationStackScreenOptions,
} from 'react-navigation'

import GitHubLoginButton from '../components/buttons/GitHubLoginButton'
import Screen from '../components/common/Screen'
import theme from '../styles/themes/dark'
import { contentPadding } from '../styles/variables'

const logo = require('../../assets/logo.png') // tslint:disable-line
const pkg = require('../../package.json') // tslint:disable-line

export interface LoginScreenProps extends NavigationScreenProps {
  error: string
  isLoggingIn: boolean
}

export interface LoginScreenState {
  loggingInMethod: 'github.public' | 'github.private' | null
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    padding: contentPadding,
    width: '100%',
  } as ViewStyle,

  header: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  mainContentContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  } as ViewStyle,

  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: contentPadding,
  } as ViewStyle,

  logo: {
    alignSelf: 'center',
    borderRadius: 100 / 8,
    height: 100,
    marginBottom: contentPadding / 2,
    width: 100,
  } as ImageStyle,

  title: {
    color: theme.base04,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 26,
  } as TextStyle,

  subtitle: {
    color: theme.base04,
    fontSize: 14,
    lineHeight: 18,
  } as TextStyle,

  button: {
    alignSelf: 'stretch',
    marginTop: contentPadding / 2,
  } as ImageStyle,

  appVersion: {
    color: theme.base05,
    fontSize: 14,
    lineHeight: 18,
  } as TextStyle,
})

export default class LoginScreen extends PureComponent<
  LoginScreenProps,
  LoginScreenState
> {
  static navigationOptions: NavigationStackScreenOptions = {
    header: null,
  }

  state: LoginScreenState = {
    loggingInMethod: null,
  }

  loginWithGithubPrivateAccess = () => {
    this.setState({ loggingInMethod: 'github.private' })

    // loginRequest({ scopes: ['user', 'repo', 'notifications', 'read:org'] })

    this.props.navigation.navigate('Main')
  }

  loginWithGithubPublicAccess = () => {
    this.setState({ loggingInMethod: 'github.public' })

    // loginRequest({
    //   scopes: ['user', 'public_repo', 'notifications', 'read:org'],
    // })

    this.props.navigation.navigate('Main')
  }

  render() {
    const { loggingInMethod } = this.state
    const { isLoggingIn } = this.props

    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.header} />

          <View style={styles.mainContentContainer}>
            <Image resizeMode="contain" source={logo} style={styles.logo} />

            <GitHubLoginButton
              loading={isLoggingIn && loggingInMethod === 'github.public'}
              onPress={this.loginWithGithubPublicAccess}
              rightIcon="globe"
              style={styles.button}
              subtitle="Public access"
              title="Sign in with GitHub"
            />

            <GitHubLoginButton
              loading={isLoggingIn && loggingInMethod === 'github.private'}
              onPress={this.loginWithGithubPrivateAccess}
              rightIcon="lock"
              style={styles.button}
              subtitle="Private access"
              title="Sign in with GitHub"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.title}>DevHub</Text>
            <Text style={styles.subtitle}>TweetDeck for GitHub</Text>
            <Text style={styles.appVersion}>{`v${pkg.version}`}</Text>
          </View>
        </View>
      </Screen>
    )
  }
}
