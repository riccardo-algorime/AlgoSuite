import {
  Button,
  Input,
  Textarea,
  VStack,
  Box,
  Text
} from '@chakra-ui/react'
import { useState } from 'react'

interface FormData {
  name: string
  email: string
  message: string
}

export const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null })

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      })

      setNotification({
        message: 'Message sent! We will get back to you soon.',
        type: 'success'
      })

      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification({ message: '', type: null })
      }, 5000)
    } catch (error) {
      setNotification({
        message: 'Failed to send message. Please try again.',
        type: 'error'
      })

      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification({ message: '', type: null })
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {notification.message && (
          <Box
            p={3}
            borderRadius="md"
            bg={notification.type === 'success' ? 'green.100' : 'red.100'}
            color={notification.type === 'success' ? 'green.800' : 'red.800'}
          >
            <Text>{notification.message}</Text>
          </Box>
        )}

        <div>
          <label htmlFor="name">Name</label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!errors.name}
          />
          {errors.name && <div style={{ color: 'red', fontSize: '0.875rem' }}>{errors.name}</div>}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!errors.email}
          />
          {errors.email && <div style={{ color: 'red', fontSize: '0.875rem' }}>{errors.email}</div>}
        </div>

        <div>
          <label htmlFor="message">Message</label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            isInvalid={!!errors.message}
          />
          {errors.message && <div style={{ color: 'red', fontSize: '0.875rem' }}>{errors.message}</div>}
        </div>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isSubmitting}
          loadingText="Sending"
        >
          Send Message
        </Button>
      </VStack>
    </form>
  )
}
