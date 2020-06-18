import * as React from 'react'
import LoginPage, { Login } from '../../pages/login'
import { MockedProvider } from '@apollo/react-testing'
import { GET_APP } from '../../graphql/queries'

export default {
  component: Login,
  title: 'Pages/Login'
}

const noop = () => {}

const errorMessage = ['Incorrect username: Please try again!']

export const _Login: React.FC = () => {
  const mocks = [
    {
      request: { query: GET_APP },
      result: {
        data: {
          session: null,
          lessons: [],
          alerts: []
        }
      }
    }
  ]

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <LoginPage />
    </MockedProvider>
  )
}

export const LoginBasic: React.FC = () => <Login handleSubmit={noop} />

export const LoginError: React.FC = () => (
  <Login handleSubmit={noop} loginErrors={errorMessage} />
)
