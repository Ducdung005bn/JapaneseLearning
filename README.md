# Japanese Learning App

[Watch the demo on YouTube here](https://www.youtube.com/watch?v=010FyFh8wEM)


## Features

### Kanji Search
- Search **directly by Kanji character**.  
- Filter by:
  - **On-yomi** (音読み)  
  - **Kun-yomi** (訓読み)  
  - **Hán Việt**  
  - **Radical (部首)**  
  - **Heisig keyword**

![alt text](https://github.com/Ducdung005bn/JapaneseLearning/blob/main/frontend/src/assets/kanjiSearch.png)

### Kanji Detail View
- JLPT level, Grade, Stroke count, Heisig, English meanings, Six principles of chinese character.

### Readings with Vocabulary
- On-yomi, Kun-yomi, Name Reading, Other Reading.  
- Expand/collapse with vocabulary examples taken from a dictionary of more than 20.000 words.

### Kanji Stroke Order Drawing
- **SVG/Canvas** animated stroke order.  

### Radical Tree View
- Expand/collapse radicals in **TreeSection.jsx**.

![alt text](https://github.com/Ducdung005bn/JapaneseLearning/blob/main/frontend/src/assets/kanjiDetail.png)

### Vocabulary Search

### Well-organized Lessons
- Review with various types of quizes.
- Open a class and give attenders your own assignments, with deadline announcement sent directly to attenders' email.

## Tech Stack

### Frontend
- **React + Vite** – Fast and modern frontend development environment.
- **TailwindCSS** – Utility-first CSS framework for responsive and clean UI design.
- **Framer Motion** – Animation library for smooth transitions and interactive components.
- **Axios** – HTTP client for communicating with the backend API.

### Backend
- **Node.js + Express** – Server-side runtime and framework to build RESTful APIs.
- **MongoDB + Mongoose** – NoSQL database with schema modeling and ODM.
- **Arcjet** – Security middleware for rate limiting and abuse prevention.
- **JWT (JSON Web Token)** – Authentication and authorization mechanism.
- **bcrypt** – Password hashing to securely store user credentials.
- **dotenv** – Environment variable management for configuration.
- **Postman** – API testing and documentation tool.

## Data Sources

The Kanji and vocabulary data used in this project are collected and normalized from multiple open sources to support Japanese learning.

### 1. Kanji Information
- **Han-Viet (Sino-Vietnamese readings)**: scraped from [HVDIC (ThiViện)](https://hvdic.thivien.net/)  
  → crawled using **Python + BeautifulSoup4**, then converted into JSON.  

- **Stroke Order / SVG Paths / Radical Structure**: from [KanjiVG](http://kanjivg.tagaini.net/)
  → extracted `path d=""` attributes to animate strokes via SVG/Canvas.  

- **Meanings, JLPT Level, Grade, Heisig Keywords**: referenced from [KanjiAPI.dev](https://kanjiapi.dev) and other public datasets.  

---

### 2. Vocabulary
- Based on the **JMdict** dictionary (Electronic Dictionary Research and Development Group - [EDRDG](https://www.edrdg.org/))  
  → mapped to each Kanji (`kanji_list`) to provide usage examples.  

---

### 3. Final Data Format
- Stored in **MongoDB** for API calling.
