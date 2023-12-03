import React from 'react';
import { Link } from 'react-router-dom';

const codeBlocks = [
  'asyncCase',
  'bubbleSortCase',
  'josephusCase',
  'insertionSortCase'
];

const Lobby = () => {
  return (
    <div>
      <h1>Choose code block</h1>
      <ul>
        {codeBlocks.map((block) => (
          <li key={block}>
            <Link to={`/codeBlock/${block}`}>{block}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
