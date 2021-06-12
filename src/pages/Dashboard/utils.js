export function formatTimeStamp(timestamp) {
  if (!timestamp) {
    return '';
  }
  const dateObj = new Date(timestamp);
  const date = dateObj.getDay();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${date} / ${month} / ${year}`;
}

export function formatConnectionDataToRowData(connection) {
  return {
    fullName: connection.fullName || '',
    connectedAt: formatTimeStamp(connection.connectedAt) || '',
    headline: connection.headline || '',
    company: connection.company || '',
    companyTitle: connection.companyTitle || '',
    contact: `${connection.contact.emailAddress || ''}
    ${
      (connection.contact.phoneNumbers && connection.contact.phoneNumbers[0]) ||
      ''
    }
    ${connection.contact.address || ''}`,
    location: `${connection.location || ''}${connection.location ? ', ' : ''}${
      connection.country || ''
    }`,
    industry: connection.industryName || '',
    id: connection._id,
    entityUrn: connection.entityUrn,
    publicIdentifier: connection.publicIdentifier,
    profileId: connection.profileId,
    firstName: connection.firstName || '',
    lastName: connection.lastName || '',
  };
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//"urn:li:fsd_profile:ACoAAC38bq0B7qMt_J7-cxSDS4KLOYmh51J3JUA"
export const getProfileIdFromUrn = (entityUrn) => {
  const arr = entityUrn.split(':');
  return arr[arr.length - 1];
};

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
