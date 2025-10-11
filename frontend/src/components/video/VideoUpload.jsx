import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { videoAPI } from '../../api/video.api'
import Button from '../common/Button'
import Input from '../common/Input'

function VideoUpload() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('videoFile', data.videoFile[0])
      formData.append('thumbnail', data.thumbnail[0])

      const result = await videoAPI.uploadVideo(formData)
      
      if (result.success) {
        navigate(`/watch/${result.data._id}`)
      } else {
        setError(result.message || 'Upload failed')
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Video</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Title"
          placeholder="Enter video title"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows="4"
            placeholder="Enter video description"
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block mb-1">Video File</label>
          <input
            type="file"
            accept="video/*"
            {...register('videoFile', { required: 'Video file is required' })}
            className="w-full"
          />
          {errors.videoFile && <p className="text-red-500 text-sm">{errors.videoFile.message}</p>}
        </div>

        <div>
          <label className="block mb-1">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            {...register('thumbnail', { required: 'Thumbnail is required' })}
            className="w-full"
          />
          {errors.thumbnail && <p className="text-red-500 text-sm">{errors.thumbnail.message}</p>}
        </div>

        <Button type="submit" disabled={uploading} className="w-full">
          {uploading ? 'Uploading...' : 'Upload Video'}
        </Button>
      </form>
    </div>
  )
}

export default VideoUpload
