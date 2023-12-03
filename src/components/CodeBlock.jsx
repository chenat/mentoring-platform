import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const socket = socketIOClient();

const CodeBlock = () => {
  const { blockId } = useParams();
  const [code, setCode] = useState(''); 
  const [userRole, setUserRole] = useState('mentor');
  const [readOnly, setReadOnly] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/codeBlock?block=${blockId}&role=${userRole}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCode(data.code);
        setReadOnly(data.readOnly);
      } catch (error) {
        console.error('Error fetching code block data:', error);
      }
    };

    fetchData();

    const handleCodeChange = (data) => {
      if (data.block === blockId) {
        setCode(data.code);
      }
    };
    socket.on('codeChange', handleCodeChange);

    const handleRoleChange = (role) => {
      setUserRole(role);
    };

    socket.on('role', handleRoleChange);

    const emitRoleChange = () => {
      socket.emit('roleChange');
    };

    if (userRole === 'mentor') {
      emitRoleChange();
    }

    return () => {
      socket.off('codeChange', handleCodeChange);
      socket.off('role', handleRoleChange);
    };
  }, [blockId, userRole]);

  const handleCodeChange = (newCode) => {
    if (userRole === 'student') {
      setCode(newCode);
      socket.emit('codeChange', { block: blockId, code: newCode });
    }
  };

  return (
    <div>
      <h2>{blockId}</h2>
      {readOnly ? (
        <SyntaxHighlighter language="javascript" style={dark}>
          {code}
        </SyntaxHighlighter>
      ) : (
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          readOnly={readOnly}
          style={{ width: '100%', height: '300px' }}
        />
      )}
    </div>
  );
};

export default CodeBlock;