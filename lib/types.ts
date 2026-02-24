// Database Types
export interface Post {
  id: string
  title: string
  description: string
  content: string
  thumbnail_url: string
  category: string
  read_time: string
  slug: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface Subscriber {
  id: string
  email: string
  active: boolean
  subscribed_at: string
}

export interface HeaderConfig {
  id: string
  main_title: string
  main_description: string
  main_image_url: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
}

// Form Types
export interface PostFormData {
  title: string
  description: string
  content: string
  category: string
  read_time: string
  slug: string
  published: boolean
  thumbnail?: FileList
}

export interface HeaderFormData {
  main_title: string
  main_description: string
  main_image?: FileList
}

export interface SubscriberFormData {
  email: string
}
