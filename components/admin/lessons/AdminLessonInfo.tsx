import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import createNewLesson from '../../../graphql/queries/createLesson'
import updateLesson from '../../../graphql/queries/updateLesson'
import { FormCard } from '../../FormCard'
import _ from 'lodash'
import {
  inputValues,
  outputValues,
  checkForErrors,
  checkForAllErrors
} from '../../../helpers/admin/lessonHelpers'
import { Lesson } from '../../../graphql/index'
import { Button } from '../../theme/Button'
import { NewChallenge, AdminLessonChallenges } from './AdminLessonChallenges'

type LessonInfoProps = {
  lessons: Lesson[] | undefined
  setLessons: React.Dispatch<React.SetStateAction<Lesson[] | null>>
  selectedLesson: number
}

type LessonBaseProps = {
  setLessons: React.Dispatch<React.SetStateAction<Lesson[] | null>>
  lesson: Lesson | undefined
}

type NewLessonProps = {
  setLessons: React.Dispatch<React.SetStateAction<Lesson[] | null>>
}

// Creates card for a lessons's information to update
const LessonBase: React.FC<LessonBaseProps> = ({ setLessons, lesson }) => {
  const [alterLesson, { loading, data }] = useMutation(updateLesson)
  const [lessonInfo, setLessonInfo] = useState(inputValues(lesson))
  // when data is fully loaded after sending mutation request, update front-end lessons info
  useEffect(() => {
    !loading && data && setLessons(data.updateLessons)
  }, [data])

  // alter gets called when someone clicks button to update a lesson
  const alter = async () => {
    const newOptions = [lessonInfo]
    const errors = checkForAllErrors(newOptions)
    if (errors) {
      setLessonInfo(newOptions)
      return
    }
    const {
      title,
      description,
      docUrl,
      githubUrl,
      videoUrl,
      order,
      chatUrl
    } = outputValues(lessonInfo)
    try {
      await alterLesson({
        variables: {
          id: parseInt(lesson ? lesson.id + '' : ''),
          title,
          description,
          docUrl,
          githubUrl,
          videoUrl,
          order: parseInt(order),
          chatUrl
        }
      })
    } catch (err) {
      throw new Error(err)
    }
  }

  const handleChange = (value: string, propertyIndex: number) => {
    const newLessonInfo = [...lessonInfo]
    newLessonInfo[propertyIndex].value = value
    checkForErrors(newLessonInfo[propertyIndex])
    setLessonInfo(newLessonInfo)
  }

  return (
    <>
      <span
        className="text-primary"
        style={{ fontSize: '4rem', textAlign: 'center', fontWeight: 'bold' }}
      >
        Lesson Info
      </span>
      <div style={{ textAlign: 'center' }} className="card">
        <FormCard
          onChange={handleChange}
          values={lessonInfo}
          onSubmit={{ title: 'Update Lesson', onClick: alter }}
          title={lesson && lesson.title + ''}
        />
      </div>
    </>
  )
}

const newLessonAttributes = {
  title: '',
  description: '',
  docUrl: '',
  githubUrl: '',
  videoUrl: '',
  order: '',
  chatUrl: ''
}

// Renders when someone clicks on `create new button` on the sidebar
const NewLesson: React.FC<NewLessonProps> = ({ setLessons }) => {
  const [createLesson, { loading, data }] = useMutation(createNewLesson)
  const [lessonInfo, setLessonInfo] = useState(inputValues(newLessonAttributes))

  // when data is fully loaded after sending mutation request, update front-end lessons info
  useEffect(() => {
    !loading && data && setLessons(data.createLesson)
  }, [data])

  // alter gets called when someone clicks button to create a lesson
  const alter = async () => {
    const newOptions = [...lessonInfo]
    const errors = checkForAllErrors(newOptions)
    if (errors) {
      setLessonInfo(newOptions)
      return
    }
    const {
      title,
      description,
      docUrl,
      githubUrl,
      videoUrl,
      order,
      chatUrl
    } = outputValues(lessonInfo)
    try {
      await createLesson({
        variables: {
          title,
          description,
          docUrl,
          githubUrl,
          videoUrl,
          order: parseInt(order),
          chatUrl
        }
      })
      window.location.reload()
    } catch (err) {
      throw new Error(err)
    }
  }

  const handleChange = (value: string, propertyIndex: number) => {
    const newLessonInfo = [...lessonInfo]
    newLessonInfo[propertyIndex].value = value
    checkForErrors(newLessonInfo[propertyIndex])
    setLessonInfo(newLessonInfo)
  }
  return (
    <div style={{ textAlign: 'center', marginBottom: 20 }} className=" col-8">
      <span
        className="text-primary"
        style={{ fontSize: '4rem', textAlign: 'center', fontWeight: 'bold' }}
      >
        Create New Lesson
      </span>
      <FormCard
        onChange={handleChange}
        values={lessonInfo}
        onSubmit={{ title: 'Create Lesson', onClick: alter }}
      />
    </div>
  )
}

export const AdminLessonInfo: React.FC<LessonInfoProps> = ({
  setLessons,
  lessons,
  selectedLesson
}) => {
  const [newChallengeView, setNewChallengeView] = useState(false)

  // true when user clicks on `create new lesson` button
  if (lessons && selectedLesson === lessons.length) {
    return <NewLesson setLessons={setLessons} />
  }

  // set currently selected lesson
  const lesson = lessons && lessons[selectedLesson]
  return (
    <div key={_.uniqueId()} style={{ textAlign: 'center' }} className="col-8">
      <div style={{ position: 'absolute', right: 0, top: 0 }}>
        <Button
          onClick={() => setNewChallengeView(!newChallengeView)}
          type="success"
        >
          {newChallengeView ? 'Back to Lesson Info' : 'Create New Challenge'}
        </Button>
      </div>
      {newChallengeView ? (
        <NewChallenge
          setLessons={setLessons}
          // challenge={challengeAttributes}
          lessonId={parseInt(lesson ? lesson.id + '' : '')}
        />
      ) : (
        <>
          <LessonBase setLessons={setLessons} lesson={lesson} />
          <hr />
          <span
            className="text-primary"
            style={{
              fontSize: '4rem',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            Lesson Challenges
          </span>

          <AdminLessonChallenges
            challenges={lesson && lesson.challenges}
            lessonId={parseInt(lesson ? lesson.id + '' : '')}
            setLessons={setLessons}
          />
        </>
      )}
    </div>
  )
}
