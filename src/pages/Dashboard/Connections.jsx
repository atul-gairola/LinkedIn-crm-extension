import React from 'react';
import Table from './Table/Table';

function Connections({ user, setRetConnections }) {
  return <Table user={user} setRetConnections={setRetConnections} />;
}

export default Connections;
