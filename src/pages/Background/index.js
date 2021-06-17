// set state in chrome storage
chrome.storage.sync.set({ userSignedIn: false });

const userSignedIn = false;
const CLIENT_ID = encodeURIComponent(
  '353459658624-2hcgq4cae4o11v1lhvd12c707cddfpv5.apps.googleusercontent.com'
);
const RESPONSE_TYPE = encodeURIComponent('id_token');
const REDIRECT_URI = encodeURIComponent(
  'https://ikjpdkijmhoecnhjeioklfacmmpldmll.chromiumapp.org'
);
const STATE = encodeURIComponent('mkdcnjfioeklks');
const SCOPE = encodeURIComponent('openid');
const PROMPT = encodeURIComponent('consent');

function createOAuth2Url() {
  let nonce = encodeURIComponent(
    Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  );
  let url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=${SCOPE}&prompt=${PROMPT}&nonce=${nonce}`;

  console.log(url);
  return url;
}

chrome.identity.onSignInChanged.addListener((resp) => {
  console.log(resp);
});

// Listener for runtime messages
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  switch (req.action) {
    case 'login':
      handleLogin(sendResponse);
      return true;
    case 'logout':
      handleLogout(sendResponse);
      return true;
    case 'initialize':
      initialize(sendResponse);
      return true;
    case 'updateConnection':
      updateConnection(req.profileId, req.publicIdentifier, sendResponse);
      return true;
    case 'getConnections':
      getConnections(req.collected, req.total, sendResponse);
      return true;
    case 'getNextUpdate':
      getNextUpdate(sendResponse);
      return true;
    case 'sendMessage':
      sendMessage(req, sendResponse);
      return true;
    case `followConnection`:
      followProfile(req.publicIdentifier, 'follow', sendResponse);
      return true;
    case 'unfollowConnection':
      followProfile(req.publicIdentifier, 'unfollow', sendResponse);
      return true;
    case 'disconnect':
      disconnect(req.profileId, sendResponse);
      return true;
  }
});

// -----------------

// helper function which adds a pause to the code for given ms
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function handleLogin(sendResponse) {
  chrome.storage.sync.get('userSignedIn', (resp) => {
    if (resp && resp.userSignedIn) {
      console.log('User already logged in');
      sendResponse({ status: 'error', error: 'user exists' });
    } else {
      try {
        chrome.identity.launchWebAuthFlow(
          {
            url: createOAuth2Url(),
            interactive: true,
          },
          (redirect_url) => {
            console.log(redirect_url);
            chrome.storage.sync.set({ userSignedIn: true });
            sendResponse({ status: 'success', redirectUrl: redirect_url });
          }
        );
        // chrome.identity.getAuthToken({ interactive: true }, (token) => {
        //   console.log(token);
        // });
        // chrome.identity.getAccounts((resp) => {
        //   console.log(resp);
        // });
        // chrome.identity.getProfileUserInfo((resp) => console.log(resp));
      } catch (e) {
        sendResponse({ status: 'error', error: e });
      }
    }
  });
}

function handleLogout(sendResponse){
  chrome.identity.launchWebAuthFlow(
    { 'url': 'https://accounts.google.com/logout' },
    function(tokenUrl) {
      console.log(tokenUrl);
        sendResponse({status: "success"});
    }
);
}

/**
 * @desc Find the csrf token of the logged in linked in user
 * @return {promise} => user is logged in ? csrfToken : undefined
 * @error if user is not logged in
 */

async function getCsrfToken() {
  const csrf = await chrome.cookies.get({
    url: 'https://www.linkedin.com',
    name: 'JSESSIONID',
  });

  if (csrf && csrf.value && csrf.value.startsWith('"')) {
    return csrf.value.slice(1, -1);
  } else {
    return false;
  }
}

// -----------------

/**
 * @desc Get the info of the logged in user
 * @param {string} url - fetch link
 * @param {boolean} withAcceptHeader - To use accept header or not
 * @param {string} [method = 'GET'] - Method of the fetch request
 * @param {object} [body = null] - body of the fetch request
 * @return {promise} => user is logged in ? userInfo : undefined
 */

async function fetchLinkedInUrl(
  url,
  withAcceptHeader = false,
  method = 'GET',
  body = null,
  params
) {
  try {
    if (body) body = JSON.stringify(body);
    const csrfToken = await getCsrfToken();

    if (!csrfToken) {
      return false;
    }

    const headers = withAcceptHeader
      ? {
          'x-restli-protocol-version': '2.0.0',
          'csrf-token': csrfToken,
          'x-li-track':
            '{"clientVersion":"1.5.*","osName":"web","timezoneOffset":1,"deviceFormFactor":"DESKTOP","mpName":"voyager-web"}',
        }
      : {
          accept: 'application/vnd.linkedin.normalized+json+2.1',
          'x-restli-protocol-version': '2.0.0',
          'csrf-token': csrfToken,
          'x-li-track':
            '{"clientVersion":"1.5.*","osName":"web","timezoneOffset":1,"deviceFormFactor":"DESKTOP","mpName":"voyager-web"}',
        };

    if (params) {
      let paramStr = '';
      Object.keys(params).forEach(
        (cur) => (paramStr += `${cur}=${params[cur]}&`)
      );

      url += `?${paramStr}`;
    }

    // console.log(url);

    const res = await fetch(url, {
      method: method,
      headers: headers,
      body,
      credentials: 'include',
    });

    // console.log(res);
    const text = await res.text();
    // console.log(text);
    const data = JSON.parse(text);
    // console.log(data);
    return data;
  } catch (e) {
    console.log(e);
  }
}

// -----------------

/**
 * @desc Get the info of the logged in user
 * @param {null}
 * @return {promise} => user is logged in ? userInfo : undefined
 */

async function getLoggedInUser() {
  try {
    const resp = await fetchLinkedInUrl(
      'https://www.linkedin.com/voyager/api/identity/profiles/me',
      true
    );

    if (!resp) {
      return resp;
    }

    const result = {
      firstName: resp.firstName,
      lastName: resp.lastName,
      country: resp.geoCountryName,
      headline: resp.headline,
      summary: resp.summary,
      entityUrn: resp.entityUrn,
      industryName: resp.industryName,
      profileId:
        resp.entityUrn &&
        resp.entityUrn
          .replace('urn:li:fsd_profile:', '')
          .replace('urn:li:fs_profile:', ''),
      location: resp.geoLocationName,
      publicIdentifier: resp.miniProfile && resp.miniProfile.publicIdentifier,
      profilePicture:
        resp.miniProfile &&
        resp.miniProfile.picture &&
        resp.miniProfile.picture['com.linkedin.common.VectorImage'] &&
        resp.miniProfile.picture['com.linkedin.common.VectorImage'].rootUrl +
          resp.miniProfile.picture['com.linkedin.common.VectorImage']
            .artifacts[2].fileIdentifyingUrlPathSegment,
    };
    return result;
  } catch (e) {
    console.log(e);
  }
}

// -----------------

/**
 * @desc Gets all 1st connection contacts of user
 * @param {null}
 * @return {Array} all contacts
 */

async function getAllOwnContacts(start = 0, count = 500, totalConnections) {
  try {
    const total =
      totalConnections ||
      (await getPaginatedOwnContacts(count, start)).paging.total;

    const promises = [...Array(Math.ceil(total / count)).keys()].map((index) =>
      getPaginatedOwnContacts(count, start + index * count).then((res) =>
        res.elements
          .map((element) => {
            if (element.connectedMemberResolutionResult) {
              return {
                ...element.connectedMemberResolutionResult,
                connectedAt: element.createdAt,
              };
            } else {
              return element.connectedMemberResolutionResult;
            }
          })
          .filter((cur) => typeof cur !== undefined)
      )
    );

    const response = await Promise.all(promises);

    let formattedContacts = [].concat(...response).map(
      (cur) =>
        cur && {
          firstName: cur.firstName,
          lastName: cur.lastName,
          headline: cur.headline,
          entityUrn: cur.entityUrn,
          publicIdentifier: cur.publicIdentifier,
          connectedAt: cur.connectedAt,
          profileId:
            cur.entityUrn && cur.entityUrn.replace('urn:li:fsd_profile:', ''),
          profilePicture:
            cur.profilePicture &&
            cur.profilePicture.displayImageReference &&
            cur.profilePicture.displayImageReference.vectorImage &&
            cur.profilePicture.displayImageReference.vectorImage.rootUrl +
              cur.profilePicture.displayImageReference.vectorImage.artifacts[2]
                .fileIdentifyingUrlPathSegment,
        }
    );

    return formattedContacts;
  } catch (e) {
    console.log(e);
    return;
  }
}

// -----------------

/**
 * @desc Gets paginated 1st connections of user
 * @param {number} [count = 10] - The number of contacts
 * @param {number}  [start = 0] - The start index
 * @return {Array} all contacts in the page
 */

async function getPaginatedOwnContacts(count = 10, start = 0) {
  try {
    const resp = await fetchLinkedInUrl(
      `https://www.linkedin.com/voyager/api/relationships/dash/connections?count=${count}&start=${start}&decorationId=com.linkedin.voyager.dash.deco.web.mynetwork.ConnectionListWithProfile-5&q=search&sortType=RECENTLY_ADDED`,
      true
    );
    return resp;
  } catch (e) {
    console.log(e);
    return;
  }
}

// -----------------

/**
 * @desc Get contact info of a profile
 * @param {String} [profileId]
 * @return {Object} contact info of the profile
 */

async function getProfileContactInfo(profileId) {
  try {
    const resp = await fetchLinkedInUrl(
      `https://www.linkedin.com/voyager/api/identity/profiles/${profileId}/profileContactInfo`
    );

    if (!resp) {
      return resp;
    }

    const { data } = resp;

    const result = {
      address: data.address && data.address,
      emailAddress: data.emailAddress && data.emailAddress,
      phoneNumbers:
        data.phoneNumbers &&
        data.phoneNumbers.length > 0 &&
        data.phoneNumbers.map((cur) => cur.number),
    };

    return result;
  } catch (e) {
    console.log(e);
  }
}

// -----------------

/**
 * @desc Gets the profile view
 * @param {String} profileIdentifier - The profile identifier of the id
 * @returns {Object} - Data of the profile from profile view
 */

async function getProfileView(profileIdentifier) {
  try {
    const response = await fetchLinkedInUrl(
      `https://www.linkedin.com/voyager/api/identity/profiles/${profileIdentifier}/profileView`,
      true
    );

    if (!response) {
      return response;
    }

    const { profile, positionView } = response;

    const result = {
      location: profile && profile.geoLocationName,
      country: profile && profile.geoCountryName,
      industryName: profile && profile.industryName,
      summary: profile && profile.summary,
      firstName: profile && profile.firstName,
      lastName: profile && profile.lastName,
      company:
        positionView &&
        positionView.elements &&
        positionView.elements.length > 0 &&
        positionView.elements[0].companyName,
      companyTitle:
        positionView &&
        positionView.elements &&
        positionView.elements.length > 0 &&
        positionView.elements[0].title,
      entityUrn: profile && profile.entityUrn,
      profileId: profile && profile.entityUrn.replace('urn:li:fs_profile:', ''),
    };

    return result;
  } catch (e) {
    console.log(e);
  }
}

/**
 * @desc Follow or unfollow a other profile.
 * @param {string} publicIdentifier - publicIdentifier of LinkedIn Profile.
 * @param {string} action - action to perform (follow & unfollow).
 * @return {Promise} Promise object for function.
 */
async function followProfile(
  publicIdentifier,
  action = 'follow',
  sendResponse
) {
  let identifier = Array.isArray(publicIdentifier)
    ? publicIdentifier
    : [publicIdentifier];

  if (identifier.length > 0) {
    for (let i = 0; i < identifier.length; i++) {
      const url = `https://www.linkedin.com/voyager/api/identity/profiles/${identifier[i]}/profileActions?action=${action}`;
      const resp = await fetchLinkedInUrl(url, false, 'POST', {});
      console.log(resp);
      if (!resp) {
        return sendNotLoggedInResponse(sendResponse);
      }
    }
  }

  sendResponse({ status: 'complete' });
}

/**
 *
 * @param {string} profileId - profileId of LinkedIn Profile.
 * @return {Promise} Promise object for function.
 */
async function disconnect(profileId, sendResponse) {
  const ids = Array.isArray(profileId) ? profileId : [proileId];
  console.log(ids);
  for (let i = 0; i < ids.length; i++) {
    await sleep(1000);
    const url = `https://www.linkedin.com/voyager/api/identity/profiles/${profileId}/profileActions?action=disconnect`;

    const resp = await fetchLinkedInUrl(url, true, 'POST', {});
    console.log(resp);

    if (!resp) {
      return sendNotLoggedInResponse(sendResponse);
    }
  }
  sendResponse({ status: 'complete' });
}

// -----------------

/**
 * @desc Sends initial data to the dashboard
 * @param {Object} sendResponse
 */
async function initialize(sendResponse) {
  try {
    const loggedInUser = await getLoggedInUser();
    if (!loggedInUser) {
      sendNotLoggedInResponse(sendResponse);
      return;
    }
    console.log('Logged in user: ', loggedInUser);
    const allContacts = await getAllOwnContacts();
    sendResponse({
      userDetails: loggedInUser,
      contacts: allContacts,
    });
  } catch (e) {
    console.log(e);
  }
}

// -----------------

async function getCompleteProfileData(profileId, publicIdentifier) {
  const contactInfo = await getProfileContactInfo(profileId);
  if (!contactInfo) {
    return contactInfo;
  }
  sleep(500);
  const profileView = await getProfileView(publicIdentifier);

  return {
    ...contactInfo,
    ...profileView,
  };
}

// -----------------

/**
 * @desc Collects and sends complete user info to the dashboard
 * @param {String} profileId
 * @param {String} publicIdentifier
 * @param {Object} sendResponse
 */

async function updateConnection(profileId, publicIdentifier, sendResponse) {
  const data = await getCompleteProfileData(profileId, publicIdentifier);
  if (!data) {
    sendNotLoggedInResponse(sendResponse);
    return;
  }
  sendResponse({
    ...data,
  });
}

// -----------------

async function getNextUpdate() {
  // await sleep(5000);
  // // get the next connection to update
  // const res = await fetch('http://localhost:8000/connections/update/next', {
  //   method: 'GET',
  // });
  // const data = await res.json();
  // const { next } = data;
  // // if no next connection return
  // if (!next) {
  //   chrome.runtime.sendMessage({ message: 'collected_all' }, () => {});
  //   return;
  // }
  // const profileId =
  //   next.profileId || next.entityUrn.replace('urn:li:fsd_profile:', '');
  // // get the complete data
  // let profileData = await getCompleteProfileData(
  //   profileId,
  //   next.publicIdentifier
  // );
  // await sleep(3000);
  // // send the data to dashboard
  // chrome.runtime.sendMessage(
  //   { message: 'next_data', updateData: profileData },
  //   () => {}
  // );
}

async function sendMessage(req, sendResponse) {
  const { messagePayloads } = req;
  if (messagePayloads.length > 0) {
    console.log(messagePayloads);
    try {
      for (let i = 0; i < messagePayloads.length; i++) {
        try {
          const data = await fetchLinkedInUrl(
            'https://www.linkedin.com/voyager/api/messaging/conversations',
            false,
            'POST',
            messagePayloads[i],
            { action: 'create' }
          );
          console.log(data);
          if (!data) {
            sendNotLoggedInResponse(sendResponse);
            return data;
          }
        } catch (e) {
          console.log(e);
          return;
        }
      }

      sendResponse({
        status: 'success',
        message: 'Message sent successfully',
      });
    } catch (e) {
      console.log(e);
      sendResponse({
        status: 'Error',
        message: 'Error while sending message.',
        error: e,
      });
    }
  } else {
    console.log(req.messagePayloads);
    sendResponse({ status: 'error', message: 'Message payload is empty.' });
  }
}

async function getConnections(collected, total, sendResponse) {
  try {
    const connections = await getAllOwnContacts(collected, 500, total);
    console.log('Connection - bg: ', connections);
    sendResponse({
      connections,
    });
  } catch (e) {
    console.log(e);
  }
}

function sendNotLoggedInResponse(sendResponse) {
  sendResponse({
    status: 'failed',
    reason: 'You are not logged into linked. Please login to continue',
  });
}
