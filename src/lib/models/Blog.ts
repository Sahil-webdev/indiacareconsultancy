import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  readTime: string;
  author: string;
  date: string;
  createdAt: Date;
}

const BlogSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true, index: true },
  image: { type: String, default: '/blogs/default-blog.jpg' },
  readTime: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
