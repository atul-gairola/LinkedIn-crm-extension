<br />
<p align="center">
  <h2 align="center">Linked In CRM</h2>

  <p align="center">
  A LinkedIn CRM which provides sleek and easy to user UI/UX to manage your connections better
    <br />
    <br />
  </p>
</p>
<br />

![image](https://user-images.githubusercontent.com/58957796/188285150-0ee0c467-d17a-41a7-840d-ba13b74f7e36.png)

<br />

# Motivation 💪

LinkedIn is a very powerful tool to create your professional network. But it is not so easy to handle and manage that network well in LinkedIn. That's the proble that LeadDelta a SaaS product saw and fixed. It is a CRM for managing LinkedIn connection 100x better. When I saw the tool it was amazing and I got very curious as to how they would've made it. So I reverse engineered it and 2 months later created this clone. Throught this process I learned a lot about extension development, how extensions access differnet browser features and a lot about how linkedin handles it data.

# About Project

This is a chromium extension made in react with a backend in Node and mongodb. We do a CSRF attack on LinkedIn's Voyager API to get access to the data. Then in the clean UI of the CRM we show the connections in a tabular format with loads of features like:
- **Global Search :** Search for a keyword and it will filter out the list of connections who have the keyword in their name, tagline, company or bio.
- **Download CSV :** Download CSV of the connections wth their data.
- **Auto Update :** Automatically updates connections with latest profile info.
- **Tags :** Create and assign tags to connections and filter them through it.
- **Bulk Messaging :** Send Bulk Messages to max 50 connections at the same time.
- **Others :** Follow, unfollow, disconnect, message all from the same dashboard.

![image](https://user-images.githubusercontent.com/58957796/188285150-0ee0c467-d17a-41a7-840d-ba13b74f7e36.png)

<br />

### Built With

- **React (create-react-app)**
- **NodeJS**
- **MongoDB**
