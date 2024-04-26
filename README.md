# Flowify✨

Flowify is currently under development. Do not use it with your Primary Spotify account as it may cause data loss.

## Overview

Flowify is a drag-and-drop environment for creating Spotify playlist generation workflows. With Flowify, you can create custom workflows to generate playlists based on your Spotify library, liked tracks, and recommendations. Flowify is built with [React Flow](https://reactflow.dev/) as the workflow builder, [bull-mq](https://github.com/taskforcesh/bullmq) for queuing, [shadcn/ui](https://ui.shadcn.com/) for components, [Drizzle](https://orm.drizzle.team/) as ORM

Flowify is heavily inspired by [SmarterPlaylists](https://github.com/plamere/SmarterPlaylists) and [Goofy](https://github.com/Chimildic/goofy). Flowify aims to provide a modern and intuitive alternative to SmarterPlaylists, while also providing a more flexible and powerful alternative to Goofy.

![Preview of Flowify Workflow Builder](./images/workflow-preview.png)

## Features

- **Intuitive Workflow Design:** Create complex playlist generation workflows effortlessly with ReactFlow's drag-and-drop visual interface.
- **Versatile Workflow Modules:** Choose from a variety of modules such as filters, combiners, orders, and library actions to build custom workflows.
- **Scheduled Workflows:** Schedule workflows to run at a specific time or on a recurring basis. (WIP)
- **Share Workflows:** Share workflows with other users. (WIP)

## Workflow Modules

<details>
<summary>Filter</summary>

- Filter by Key-Value Pair
- Deduplicate Tracks
- Deduplicate Artists
- Match Key-Value Pair
- Limit Tracks

</details>

<details>
<summary>Combiner</summary>

- Push Tracks
- Alternate Tracks

</details>

<details>
<summary>Order</summary>

- Sort Tracks by Key
- Shuffle Tracks

</details>

<details>
<summary>Selector</summary>

- First N Tracks
- Last N Tracks
- Random N Tracks
- All but First N Tracks
- All but Last N Tracks
- Recommended Tracks (Using Spotify Recommendations API)

</details>

<details>
<summary>Library</summary>
- Get Liked Tracks
- Save Playlist as New
- Save Playlist by Appending
- Save Playlist by Replacing

</details>

<details>
<summary>Playlist</summary>
- Search and use existing playlists


</details>

More modules coming soon 👀

## Running Locally

To get started with Flowify, follow these steps:

1. **Installation:**

   ```bash
    git clone https://github.com/radityaharya/flowify
   ```

   ```bash
     cd flowify
   ```

   ```bash
     npm install
   ```

2. **Run Redis:**
   Start a Redis server. You can download and install Redis from the [official website](https://redis.io/). Alternatively, you can use a cloud service such as [Railway](https://docs.railway.app/guides/redis) or [Upstash](https://upstash.com/). Redis is used for queueing and caching.

3. **Set Up Database:**
    Create a Postgres database and set the `DATABASE_URL` environment variable. You can use a local Postgres instance or a cloud service such as [Neon](https://neon.tech/). Flowify uses [Drizzle](https://orm.drizzle.team/) as the ORM.

4. **Set Up Spotify API:**
   Create a Spotify developer account and create a new application. You can find instructions on how to do this [here](https://developer.spotify.com/documentation/web-api/concepts/apps). Keep the client ID and client secret handy.

5. **Set Up Environment Variables:**
   Create a `.env` file in the root directory and add the following variables:

   | Variable              | Description                        |
   | --------------------- | -----------------------------------|
   | DATABASE_URL          | Postgres connection string         |
   | NEXTAUTH_SECRET       | NextAuth secret key                |
   | NEXTAUTH_URL          | NextAuth application URL           |
   | SPOTIFY_CLIENT_ID     | Spotify API client ID              |
   | SPOTIFY_CLIENT_SECRET | Spotify API client secret          |
   | REDIS_URL             | Redis connection URL               |
   | NO_WORKER             | Disables built-in workflow runner  |

6. **Push the schema to your database:**

   ```bash
   npm run db:push
   ```

7. **Run the Application:**

   ```bash
   npm run dev
   ```

8. **Open Flowify:**
   Open your browser and go to [http://localhost:3000](http://localhost:3000).


<details>
<summary><strong>Disclaimer</strong></summary>

Flowify is an independent project, developed with the intention of serving as an educational tool, for personal use, and as a hosted service. It is important to clarify that Flowify is not affiliated with, endorsed by, or in any way officially connected with Spotify AB, or any of its subsidiaries or its affiliates.

The images utilized in this project are sourced directly from Spotify's Content Delivery Network (CDN) via the Spotify Web API. These images are not modified or altered in any way by this project, and remain the property of their respective copyright holders.

For official Spotify services, please visit the official Spotify website at https://www.spotify.com. Please be aware that Spotify is a registered trademark of Spotify AB.

The author of Flowify makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the content of this project or the hosted service. The author will not be liable for any errors or omissions in this information nor for the availability of this information. The author will not be liable for any losses, or damages from the display or use of this information or the hosted service, whether they be direct, indirect, incidental, special, consequential or other forms of damages.

The hosted service is provided "as is" and on an "as available" basis, with no guarantees of uptime or reliability. The author is not responsible for any data loss or damage that may occur from the use of the hosted service.

The author respects the privacy of users and takes data security seriously. However, the author cannot guarantee the security of any data transmitted to the hosted service and is not responsible for any breach of security or for the actions of any third parties that may obtain any personal information.

By using the hosted service, you agree to accept all risks associated with the use of the service and agree not to hold the author liable for any issues, losses, or damages that may arise from its use.

</details>
