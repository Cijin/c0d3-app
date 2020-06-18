import * as React from 'react'
import _ from 'lodash'
import Layout from '../../components/Layout'
import { Lesson } from '../../@types/lesson'
import { AppData } from '../../@types/app'
import { UserSubmission, Challenge } from '../../@types/challenge'
import { GET_APP } from '../../graphql/queries'
import ProfileLessons from '../../components/ProfileLessons'
import ProfileImageInfo from '../../components/ProfileImageInfo'
import ProfileSubmissions from '../../components/ProfileSubmissions'
import withQueryLoader, {
  QueryDataProps
} from '../../containers/withQueryLoader'

export type UserInfo = {
  username: string
  firstName: string
  lastName: string
}

const UserProfile: React.FC<QueryDataProps<AppData>> = ({ queryData }) => {
  const { lessons, session } = queryData
  const fullname = _.get(session, 'user.name', '')
  const username = _.get(session, 'user.username', '')

  const userInfo: UserInfo = {
    username,
    firstName: fullname.split(' ')[0],
    lastName: fullname.split(' ')[1]
  }

  const userSubmissions: UserSubmission[] = _.get(session, 'submissions', [])
  const lessonInfo = lessons.map((lesson: Lesson) => {
    const { challenges, order } = lesson
    const passedLessonSubmissions = userSubmissions.filter(
      ({ status, lessonId }) => {
        // TODO: Fix lesson.id and lessonId types
        return (
          status === 'passed' &&
          parseInt(lessonId || '') === parseInt(lesson.id + '')
        )
      }
    )
    const updateSubmissions = passedLessonSubmissions.filter(
      ({ challengeId }) => challengeId
    )
    const lessonProgress = updateSubmissions.length / challenges.length
    const progress = Math.floor(lessonProgress * 100)

    return { progress, order }
  })

  const profileLessons = lessons.map(({ order, title, challenges }: Lesson) => {
    const challengesStatus = challenges.map((c: Challenge) => {
      const challengeSubmission = userSubmissions.find(
        (s: UserSubmission) => c.id === s.challengeId
      )

      return {
        challengeNumber: order,
        challengeStatus: challengeSubmission
          ? challengeSubmission.status
          : 'open'
      }
    })

    return {
      order,
      title,
      challenges: challengesStatus
    }
  })

  return (
    <Layout>
      <div className="row">
        <div className="col-4">
          <ProfileImageInfo user={userInfo} />
        </div>
        <div className="col-8">
          <ProfileLessons lessons={lessonInfo} />
          <ProfileSubmissions lessons={profileLessons} />
        </div>
      </div>
    </Layout>
  )
}

export default withQueryLoader<AppData>(
  {
    query: GET_APP
  },
  UserProfile
)
