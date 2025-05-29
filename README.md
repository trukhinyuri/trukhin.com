# Personal Site

This project is a personal website designed to showcase the professional profile of Yuri Trukhin, aimed at tech employers, investors, and partners. The site features a clean, modern layout that highlights key achievements, experience, skills, and impact metrics.

## Project Structure

The project consists of the following files and directories:

```
personal-site/
├── index.html           # Single-page landing built with Tailwind CDN
├── package.json         # npm config (for future scripts/deps)
├── postcss.config.js    # (optional, if local build is needed)
├── tailwind.config.js   # (optional, Tailwind customization)
├── README.md            # Project overview
├── LICENSE              # MIT License
└── .gitignore           # Git ignore rules
```

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd personal-site
   ```

2. **Install Dependencies** (optional for local build)
   ```bash
   npm install
   ```

3. **Build the Project**
   To build the CSS using Tailwind and PostCSS, run:
   ```bash
   npm run build
   ```

4. **Serve the Project**
   To serve the project locally, use:
   ```bash
   npm start
   ```

## Usage

Open `index.html` in your web browser or serve the directory on a static host (e.g., GitHub Pages) to view the landing. Responsive design ensures seamless experience on desktop and mobile.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.