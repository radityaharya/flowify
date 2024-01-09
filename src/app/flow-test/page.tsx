/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";
import React, { useState } from 'react';

const Page = () => {
  const [jsonValue, setJsonValue] = useState('');
  const [response, setResponse] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonValue(event.target.value);
  };

  const workflow = {
    name: "spotify-playlist",
    sources: [
      {
        id: "playlist1",
        type: "playlist",
        params: {
          playlistId: "4rgpmMVnicF0U90eoc5sUG",
        },
      },
      {
        id: "playlist2",
        type: "playlist",
        params: {
          playlistId: "1lRI38EWAozAe9ra141sPq",
        },
      },
    ],
    operations: [
      {
        id: "filter",
        type: "Filter.filter",
        params: {
          filterKey: "track.popularity",
          filterValue: "> 20",
        },
        sources: ["playlist1"],
      },
      {
        id: "filter2",
        type: "Filter.dedupeArtists",
        params: {},
        sources: ["filter"],
      },
    ],
  };

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    console.log("jobId: ", jobId);
    if (jobId) {
      intervalId = setInterval(() => {
        console.log("fetching job: ", jobId);
        fetch(`/api/workflow/${jobId}`)
          .then(response => response.json())
          .then(data => {
            setResponse(data as string);
          })
          .catch(error => {
            console.error(error);
          });
      }, 2500);
    }
  
    // Clear interval on component unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId]);

  const handleSubmit = () => {
    console.log("builtin workflow: ", JSON.stringify(workflow, null, 2));
    fetch('/api/workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonValue
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response from the server
        setResponse(data as string);
        setJobId(data.job.id);
      })
      .catch(error => {
        // Handle any errors
        console.error(error);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <textarea
        className="w-64 h-32 p-2 border border-gray-300 rounded text-black"
        value={jsonValue}
        onChange={handleTextareaChange}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 rounded"
        onClick={handleSubmit}
      >
        Send JSON
      </button>
      {response && (
        <div className="mt-4 p-2 rounded max-h-64 max-w-lg overflow-auto">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Page;
