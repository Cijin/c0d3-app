jest.mock('../dbload')
jest.mock('../mattermost')
jest.mock('node-fetch')
jest.mock('mailgun-js')
import db from '../dbload'
import fetch from 'node-fetch'
import resolvers from '../../graphql/resolvers'
import { publicChannelMessage, getUserByEmail } from '../mattermost'

const { Mutation } = resolvers
const { Lesson, Submission, User, Challenge } = db

describe('Submissions', () => {
  jest.unmock('../updateSubmission')

  const controller = require.requireActual('../updateSubmission')
  controller.updateSubmission = jest.fn()

  const args = {
    challengeId: 'fakeChallengeId',
    cliToken:
      'eyJpZCI6MTIxMCwiY2xpVG9rZW4iOiIxdHhrYndxMHYxa0hoenlHWmFmNTMifQ==',
    diff: 'fakeDiff',
    lessonId: 'fakeLessonId'
  }

  describe('createSubmission', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    test('should return submission', async () => {
      const submission = { ...args, update: jest.fn() }
      const username = 'fake user'
      const challengeTitle = 'fake challenge title'
      const lessonId = '1337'

      // mock the current user
      User.findByPk = jest.fn().mockResolvedValue({ username, id: 'userId' })

      // mock the submission
      Submission.findOrCreate = jest.fn().mockResolvedValue([submission])

      // mock the challenge that is associated with the submission
      Challenge.findByPk = jest.fn().mockReturnValue({ title: challengeTitle })

      // mock the current lesson that is associated with the submission
      Lesson.findByPk = jest.fn().mockReturnValue({
        chatUrl: 'https://fake/url/channels/js1-variablesfunction',
        id: lessonId,
        order: 1
      })

      // mock the next lesson
      Lesson.findOne = jest.fn().mockReturnValue(null)

      // mock mattermost getUserByEmail
      getUserByEmail.mockReturnValue(username)

      const res = await Mutation.createSubmission(null, args)
      expect(res).toEqual(submission)
    })

    test('should notify next lesson channel when there is a next lesson', async () => {
      const submission = { ...args, update: jest.fn() }
      const username = 'fake user'
      const channelName = 'js2-arrays'
      const challengeTitle = 'fake challenge title'
      const lessonId = '1337'

      // mock the current user
      User.findByPk = jest.fn().mockResolvedValue({ username, id: 'userId' })

      // mock the submission
      Submission.findOrCreate = jest.fn().mockResolvedValue([submission])

      // mock the challenge that is associated with the submission
      Challenge.findByPk = jest.fn().mockReturnValue({ title: challengeTitle })

      // mock the current lesson that is associated with the submission
      Lesson.findByPk = jest.fn().mockReturnValue({
        chatUrl: 'https://fake/url/channels/js1-variablesfunction',
        id: lessonId,
        order: 1
      })

      // mock the next lesson
      Lesson.findOne = jest.fn().mockReturnValue({
        chatUrl: `https://fake/url/channels/${channelName}`,
        order: 2
      })

      // mock mattermost getUserByEmail
      getUserByEmail.mockReturnValue(username)

      await Mutation.createSubmission(null, args)
      expect(publicChannelMessage).toHaveBeenCalledWith(
        channelName,
        `@${username} has submitted a solution **_${challengeTitle}_**. Click [here](<https://www.c0d3.com/review/${lessonId}>) to review the code.`
      )
    })

    test('should not notify any channel when there is no next lesson', async () => {
      const submission = { ...args, update: jest.fn() }
      const username = 'fake user'
      const challengeTitle = 'fake challenge title'
      const lessonId = '1337'

      // mock the current user
      User.findByPk = jest.fn().mockResolvedValue({ username, id: 'userId' })

      // mock the submission
      Submission.findOrCreate = jest.fn().mockResolvedValue([submission])

      // mock the challenge that is associated with the submission
      Challenge.findByPk = jest.fn().mockReturnValue({ title: challengeTitle })

      // mock the current lesson that is associated with the submission
      Lesson.findByPk = jest.fn().mockReturnValue({
        chatUrl: 'https://fake/url/channels/js1-variablesfunction',
        id: lessonId,
        order: 1
      })

      // mock the next lesson
      Lesson.findOne = jest.fn().mockReturnValue(null)

      // mock mattermost getUserByEmail
      getUserByEmail.mockReturnValue(username)

      await Mutation.createSubmission(null, args)
      expect(publicChannelMessage).not.toHaveBeenCalled()
    })

    test('should throw error Invalid args', async () => {
      await expect(Mutation.createSubmission(null, null)).rejects.toThrow(
        'Invalid args'
      )
    })
  })

  test('acceptSubmission should call updateSubmission', async () => {
    const submission = { id: 1, comment: 'fake comment', reviewer: 2 }
    const ctx = { req: { session: { userId: 2 } } }
    await resolvers.Mutation.acceptSubmission(null, submission, ctx)
    expect(controller.updateSubmission).toHaveBeenCalledWith({
      ...submission,
      reviewerId: 2,
      status: 'passed'
    })
  })

  test('acceptSubmission should throw error with no args', async () => {
    await await expect(resolvers.Mutation.acceptSubmission()).rejects.toThrow(
      'Invalid args'
    )
  })

  test('acceptSubmission should throw error with no user', async () => {
    const submission = { id: 1, comment: 'fake comment' }
    await await expect(
      resolvers.Mutation.acceptSubmission(null, submission)
    ).rejects.toThrow('Invalid user')
  })

  test('rejectSubmission should call updateSubmission', async () => {
    const submission = { id: 1, comment: 'fake comment' }
    const ctx = { req: { session: { userId: 2 } } }
    await resolvers.Mutation.rejectSubmission(null, submission, ctx)
    expect(controller.updateSubmission).toHaveBeenCalledWith({
      ...submission,
      reviewerId: 2,
      status: 'needMoreWork'
    })
  })

  test('rejectSubmission should throw error with no args', async () => {
    await await expect(resolvers.Mutation.rejectSubmission()).rejects.toThrow(
      'Invalid args'
    )
  })

  test('rejectSubmission should throw error with no user', async () => {
    const submission = { id: 1, comment: 'fake comment' }
    await await expect(
      resolvers.Mutation.rejectSubmission(null, submission)
    ).rejects.toThrow('Invalid user')
  })
})
