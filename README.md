# CRM By Ali Hamza

<div align="center">
  <img src="public/logo.png" alt="CRM By Ali Hamza Logo" width="120" />
  <h3>Professional Customer Relationship Management System</h3>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/next.js-14.0-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/typescript-5.0-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/mongodb-atlas-green?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/tailwindcss-3.3-teal?logo=tailwindcss" alt="Tailwind CSS" />
</div>

<br />

## ✨ Features

- 📊 **Intuitive Dashboard** - Track key metrics and visualize your business performance
- 👥 **Customer Management** - Store and manage customer information effectively
- 🔒 **Role-Based Access** - Super Admin, Sub Admin, and Viewer roles with granular permissions
- 📱 **Responsive Design** - Access your CRM from any device, anywhere
- 🌗 **Dark/Light Mode** - Choose the theme that's easiest on your eyes
- 🖼️ **Image Uploads** - Cloudinary integration for profile pictures and attachments

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- MongoDB database (Atlas recommended)
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AliHamza-Coder/My-Custom-CRM.git
   cd My-Custom-CRM
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables (see below)

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Cloudinary Configuration (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/?retryWrites=true&w=majority
```

### 🔑 How to obtain these values:

#### Cloudinary Setup:
1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Navigate to Dashboard > Settings > Access Keys
3. Copy your Cloud Name, API Key, and API Secret
4. For the upload preset, go to Settings > Upload > Upload presets and create or use an existing preset

#### MongoDB Setup:
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Set up a database user with read/write permissions
3. Under Database Deployments, click "Connect" on your cluster
4. Select "Connect your application" and copy the connection string
5. Replace `<username>` and `<password>` with your database user credentials

## 🛡️ Security Best Practices

- **Never commit** your `.env.local` file to version control
- Store sensitive keys and secrets securely
- Use environment variable management in your deployment platform
- Regularly rotate your API keys and secrets

## 📘 Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🧑‍💻 Author

**Ali Hamza** - [GitHub](https://github.com/ali-hamza)

---

<p align="center">© 2025 CRM By Ali Hamza. All rights reserved.</p>
