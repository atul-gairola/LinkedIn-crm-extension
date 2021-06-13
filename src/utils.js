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
    emailAddress: connection.contact.emailAddress || '',
    phoneNumber:
      (connection.contact.phoneNumbers && connection.contact.phoneNumbers[0]) ||
      '',
    address: connection.contact.address || '',
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

export const replaceTemplateWithValue = (template, data) => {
  let tempStr = template;

  function replace() {
    const openIndex = tempStr.indexOf('{{');
    const closeIndex = tempStr.indexOf('}}');

    if (openIndex !== -1 && closeIndex !== -1) {
      const key = tempStr.substring(openIndex + 2, closeIndex);
      tempStr =
        tempStr.substring(0, openIndex) +
        data[key] +
        tempStr.substring(openIndex + key.length + 4, tempStr.length);
      replace();
    } else {
      return;
    }
  }

  replace();

  return tempStr;
};

export const connectionCSVData = (connection) => {
  return [
    (connection.firstName && `"${connection.firstName}"`) || ' ',
    (connection.lastName && `"${connection.lastName}"`) || ' ',
    (connection.connectedAt && `"${connection.connectedAt}"`) || ' ',
    (connection.headline && `"${connection.headline}"`) || ' ',
    (connection.company != false && `"${connection.company}"`) || ' ',
    (connection.companyTitle != false && `"${connection.companyTitle}"`) || ' ',
    (connection.industry && `"${connection.industry}"`) || ' ',
    (connection.emailAddress && `"${connection.emailAddress}"`) || ' ',
    (connection.phoneNumber && `"${connection.phoneNumber}"`) || ' ',
    (connection.address && `"${connection.address}"`) || '',
    (connection.location && `"${connection.location}"`) || ' ',
    `https://www.linkedin.com/in/${connection.entityUrn}`,
  ];
};

// downloads the members as CSV
export const downloadAsCSV = (data, filename) => {
  // csvFormat = csvFormat.split(',').join('\n');
  // const contacts = `Contacts\n${csvFormat}`;

  const connections = data.map((cur) => cur.join(',')).join('\n');

  const blob = new Blob([connections], {
    type: 'text/csv;charset=utf-8;',
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
