// Listener for runtime messages
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  switch (req.action) {
    case 'initialize':
      initialize(sendResponse);
      return true;
  }
});

// -----------------

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
    throw new Error('You are not logged into linkedIn. Please login.');
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
  body = null
) {
  try {
    if (body) body = JSON.stringify(body);
    const csrfToken = await getCsrfToken();

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

    const res = await fetch(url, {
      method: method,
      headers: headers,
      body,
      credentials: 'include',
    });
    const text = await res.text();
    const data = JSON.parse(text);
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

    const result = {
      firstName: resp.firstName,
      lastName: resp.lastName,
      country: resp.geoCountryName,
      headline: resp.headline,
      summary: resp.summary,
      entityUrn: resp.entityUrn,
      industryName: resp.industryName,
      profileId:
        resp.entityUrn && resp.entityUrn.replace('urn:li:fsd_profile:', ''),
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

async function getAllOwnContacts() {
  try {
    let count = 500;
    let start = 0;
    const contacts = await getPaginatedOwnContacts(count, start);
    const { total } = contacts.paging;

    const promises = [...Array(Math.ceil(total / count)).keys()].map((index) =>
      getPaginatedOwnContacts(count, index * count).then((res) =>
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
    const { data } = await fetchLinkedInUrl(
      `https://www.linkedin.com/voyager/api/identity/profiles/${profileId}/profileContactInfo`
    );

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

// -----------------

async function initialize(sendResponse) {
  const loggedInUser = await getLoggedInUser();
  const allContacts = await getAllOwnContacts();

  sendResponse({
    userDetails: loggedInUser,
    contacts: allContacts,
  });
}
