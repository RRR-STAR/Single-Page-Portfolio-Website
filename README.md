# Web-Editable Single Page Portfolio

Welcome to the **Web-Editable Single Page Portfolio**! This project is a highly dynamic, beautifully styled developer portfolio template designed to be edited, customized, and deployed directly from your web browser—without needing to write a single line of code or set up a local development environment.

## 🌟 What is this website for?
If you are a student, designer, or developer who wants a stunning online presence but doesn't want to spend hours hard-coding HTML and CSS, this template is for you. 

It features a cutting-edge **Live Editor Engine** built right into the browser. You just double-click the text you want to change, upload your images, and click "Deploy". It utilizes modern "Glassmorphism" design, interactive canvas background animations, and responsive responsive layouts by default.

---

## 🛠️ How to use this template?

Using the portfolio is incredibly straightforward:
1. **Open the Site:** Open `index.html` in any modern web browser (Edge, Chrome, Safari). 
2. **Toggle Edit Mode:** Look for the floating **✏️ Edit** button on the bottom right of the screen. Click it. 
3. **Customize your content:**
   - **Text:** Click on any text (names, paragraphs, skill titles) to type directly over it.
   - **Images:** Hover over any image to reveal the "Change Image" button. You can upload an image from your computer. 
   - **Sections:** Hover over project cards or skills. You'll see a green **"+"** icon to add new cards, or a red **"🗑️"** icon to delete them. 
4. **Save your progress:** All your edits are automatically saved to your browser's local storage. You can safely close the tab and return later without losing your work.
5. **Preview:** Click the **✏️ Edit** button again to exit Edit Mode and see your live website!

---

## 🚀 How to deploy your portfolio to the Internet?

You have two powerful options to make your portfolio live and shareable with the world:

### Option A: The 1-Click Netlify Deploy (Recommended & Easiest)
Want to go live in 5 seconds? We've built an automated pipeline straight into the interface.
1. Make sure you are in **Normal Mode** (not Edit Mode).
2. Click the floating **🚀 Deploy** button on the bottom right of the screen.
3. A popup will ask for a **Netlify Personal Access Token**. 

**How to get your Netlify Token:**
- If you don't have one, create a free account at [Netlify](https://app.netlify.com/).
- Go to your **User Settings > Applications** or simply click [this shortcut link](https://app.netlify.com/user/applications#personal-access-tokens).
- Click **"New access token"**, give it a name (like "Portfolio Deploy"), and copy the long string of characters it gives you.
- Paste that token into the Deploy popup in your portfolio.

4. Click **Launch Site**.
5. Within seconds, a Success Modal will appear giving you your live, public URL! (You'll also notice a new **🔗 Visit** button permanently appears above the deploy button so you can instantly jump to your live site anytime). 

*Note: If you make more edits later, just click Deploy again. It will automatically update your existing live site!*

---

### Option B: Export & Deploy manually via GitHub Pages (For developers)
If you prefer to host your website on GitHub Pages for free, you can easily export your progress into a clean code bundle.

1. In **Normal Mode**, click the floating **📦 Export** button.
2. The site will instantly compile all your custom text, styles, and uploaded images into a pristine, production-ready `my-portfolio.zip` file which will automatically download to your computer.
3. Extract the `.zip` file on your computer. You will see a clean structure: `index.html`, `style.css`, `app.js`, and an `img/` folder.
4. **Deploy to GitHub:**
   - Create a free account at [GitHub.com](https://github.com/).
   - Click the **"+"** icon in the top right to create a **New Repository**.
   - Give it a name (e.g., `my-portfolio`) and make it **Public**.
   - Upload the extracted files (`index.html`, etc.) directly into the repository.
   - Go to the repository **Settings** tab.
   - Click on **Pages** in the left sidebar.
   - Under "Build and deployment", set the **Source** to `Deploy from a branch`.
   - Set the Branch to `main` (or `master`) and click **Save**.
5. Give GitHub a minute or two, and your portfolio will be live at `https://[your-username].github.io/[repository-name]`!
