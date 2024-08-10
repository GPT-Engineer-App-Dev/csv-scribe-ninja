import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const APIKeyInput = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onApiKeySubmit(apiKey);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
      <Input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter your OpenAI API key"
        className="flex-grow"
      />
      <Button type="submit">Set API Key</Button>
    </form>
  );
};

export default APIKeyInput;