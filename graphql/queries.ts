import { gql } from 'apollo-boost'

export const LOGOUT_USER = gql`
  mutation {
    logout {
      success
      username
      error
    }
  }
`

export const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
      username
      cliToken
      error
    }
  }
`

export const RESET_PASSWORD = gql`
  mutation reqPwReset($userOrEmail: String!) {
    reqPwReset(userOrEmail: $userOrEmail) {
      success
      token
    }
  }
`

export const UPDATE_PASSWORD = gql`
  mutation changePw($token: String!, $password: String!) {
    changePw(token: $token, password: $password) {
      success
    }
  }
`

export const SIGNUP_USER = gql`
  mutation signup(
    $firstName: String!
    $lastName: String!
    $email: String!
    $username: String!
  ) {
    signup(
      firstName: $firstName
      lastName: $lastName
      email: $email
      username: $username
    ) {
      success
      username
      error
    }
  }
`

export const GET_SUBMISSIONS = gql`
  query submissions($lessonId: String!) {
    submissions(lessonId: $lessonId) {
      id
      status
      diff
      comment
      challengeId
      user {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`

export const ACCEPT_SUBMISSION = gql`
  mutation acceptSubmission($submissionId: String!, $comment: String!) {
    acceptSubmission(id: $submissionId, comment: $comment) {
      id
      comment
      status
    }
  }
`

export const REJECT_SUBMISSION = gql`
  mutation rejectSubmission($submissionId: String!, $comment: String!) {
    rejectSubmission(id: $submissionId, comment: $comment) {
      id
      comment
      status
    }
  }
`
export const USER_INFO =  gql`
 query {
  userInfo(username: String!){
    lessons {
      id
      title
      description
      docUrl
      githubUrl
      videoUrl
      order
      challenges {
        id
        title
        description
        order
      }
      chatUrl
    }
    session {
      user {
        id
        username
        name
      }
      submissions {
        id
        status
        mrUrl
        diff
        viewCount
        comment
        order
        challengeId
        lessonId
        reviewer {
          id
          username
        }
        createdAt
        updatedAt
      }
      lessonStatus {
        lessonId
        isPassed
        isTeaching
        isEnrolled
      }
    }
    alerts {
      id
      text
      type
      url
      urlCaption
    }
  }
 }
`

export const GET_APP = gql`
  query {
    lessons {
      id
      title
      description
      docUrl
      githubUrl
      videoUrl
      order
      challenges {
        id
        title
        description
        order
      }
      chatUrl
    }
    session {
      user {
        id
        username
        name
      }
      submissions {
        id
        status
        mrUrl
        diff
        viewCount
        comment
        order
        challengeId
        lessonId
        reviewer {
          id
          username
        }
        createdAt
        updatedAt
      }
      lessonStatus {
        lessonId
        isPassed
        isTeaching
        isEnrolled
      }
    }
    alerts {
      id
      text
      type
      url
      urlCaption
    }
  }
`

export const ADD_ALERT = gql`
  mutation addAlert($text: String!, $type: String!) {
    addAlert(text: $text, type: $type) {
      success
    }
  }
`
