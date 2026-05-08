// TEMPORARY: Test if import works
import React from 'react';
import AboutSection from "./components/AboutSection";

const TestComponent = () => {
  console.log('AboutSection:', AboutSection);
  return <div>Test</div>;
};

export default function Index() {
  return (
    <div>
      <TestComponent />
      <div style={{ color: "green", fontSize: "32px" }}>
        INDEX PAGE IS RENDERING ✅
      </div>
    </div>
  );
}