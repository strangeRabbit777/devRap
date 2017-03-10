// @flow

import * as firebase from 'firebase';
import { delay } from 'redux-saga';
import { call, fork, put, select, takeLatest } from 'redux-saga/effects';

import {
  APP_READY,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  RESET_APP_DATA,
} from '../utils/constants/actions';

import oauth from './oauth';
import { sagaActionChunk } from './_shared';
import { loginSuccess, loginFailure, updateCurrentUser } from '../actions';
import { accessTokenSelector } from '../selectors';
import type { Action, LoginRequestPayload } from '../utils/types';

function* onLoginRequest({ payload }: Action<LoginRequestPayload>) {
  const oauthURL = 'https://micro-oauth-pmkvlpfaua.now.sh';
  const { scopes } = payload;

  try {
    const params = yield call(oauth, oauthURL, scopes);
    const result = { accessToken: params.access_token };
    yield put(loginSuccess(payload, result, sagaActionChunk));
  } catch (e) {
    console.log('Login failed', e);
    const errorMessage = e &&
      ((e.message || {}).message || e.message || e.body || e.status);
    yield put(loginFailure(payload, errorMessage, sagaActionChunk));
  }
}

function* signInOnFirebase() {
  const state = yield select();
  const accessToken = accessTokenSelector(state);

  if (!accessToken) {
    return;
  }

  // sign in with firebase
  try {
    const credential = firebase.auth.GithubAuthProvider.credential(accessToken);
    yield firebase.auth().signInWithCredential(credential);
  } catch (e) {
    console.error(`Failed to login on Firebase: ${e.message}`, e);
  }
}

function* onLoginSuccessOrRestored() {
  yield signInOnFirebase();
}

function* onLogoutRequest() {
  try {
    yield firebase.auth().signOut();
  } catch (e) {
    console.error(`Failed to logout from Firebase: ${e.message}`, e);
  }
}

function* watchFirebaseCurrentUser() {
  const ignoreValue = 'ignore';
  let lastUser = ignoreValue;

  firebase.auth().onAuthStateChanged((user) => {
    lastUser = user;
  });

  while (true) {
    if (lastUser !== ignoreValue) {
      // console.log('firebase user', lastUser);
      const user = lastUser && lastUser.providerData && lastUser.providerData[0];
      lastUser = ignoreValue;

      const payload = user ? { ...user, lastAccessedAt: new Date() } : undefined;
      yield put(updateCurrentUser(payload, sagaActionChunk));
    }

    yield call(delay, 1000);
  }
}

export default function* () {
  return yield [
    yield takeLatest(LOGIN_REQUEST, onLoginRequest),
    yield takeLatest([LOGIN_SUCCESS, APP_READY], onLoginSuccessOrRestored),
    yield takeLatest([LOGIN_FAILURE, LOGOUT, RESET_APP_DATA], onLogoutRequest),
    yield fork(watchFirebaseCurrentUser),
  ];
}
