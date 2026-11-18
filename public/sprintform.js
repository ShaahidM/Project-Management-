import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { DatePicker, Space, Select } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const closeAddSprintForm = (resetForm) => {
  const form = document.getElementById('add-sprint-form');
  if (form) {
    form.style.display = 'none';
  }
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
  if (resetForm) {
    resetForm();
  }
};

const SprintForm = () => {
  const [productOwner, setProductOwner] = useState(null);
  const [scrumMaster, setScrumMaster] = useState(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [sprintDates, setSprintDates] = useState([]);
  const [sprintName, setSprintName] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const handlePrefill = (e) => {
      const { sprintName, sprintStartDate, sprintEndDate, productOwner, scrumMaster, selectedTeamMembers } = e.detail;
      
      // Ensure both dates are valid before setting them
      const startDate = sprintStartDate ? dayjs(sprintStartDate, 'YYYY-MM-DD') : null;
      const endDate = sprintEndDate ? dayjs(sprintEndDate, 'YYYY-MM-DD') : null;
      
      setSprintName(sprintName);
      setSprintDates([startDate, endDate]);  // Set the sprint dates
      setProductOwner(productOwner);
      setScrumMaster(scrumMaster);
      setSelectedTeamMembers(selectedTeamMembers);
    };

    document.addEventListener('prefillSprintForm', handlePrefill);

    return () => {
      document.removeEventListener('prefillSprintForm', handlePrefill);
    };
  }, []);

  useEffect(() => {
    const fetchTeamMembers = () => {
      if (window.initialTeamMembers) {
        setTeamMembers(window.initialTeamMembers);
      } else {
        // Polling to check if initialTeamMembers is available
        const interval = setInterval(() => {
          if (window.initialTeamMembers) {
            setTeamMembers(window.initialTeamMembers);
            clearInterval(interval);
          }
        }, 100);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleProductOwnerChange = (value) => {
    setProductOwner(value);
    updateTeamMembers(value, scrumMaster);
  };

  const handleScrumMasterChange = (value) => {
    setScrumMaster(value);
    updateTeamMembers(productOwner, value);
  };

  const updateTeamMembers = (productOwner, scrumMaster) => {
    let updatedTeamMembers = [...selectedTeamMembers];
    if (productOwner && !updatedTeamMembers.includes(productOwner)) {
      updatedTeamMembers.push(productOwner);
    }
    if (scrumMaster && !updatedTeamMembers.includes(scrumMaster)) {
      updatedTeamMembers.push(scrumMaster);
    }
    setSelectedTeamMembers(updatedTeamMembers);
  };

  const handleTeamMembersChange = (value) => {
    setSelectedTeamMembers(value);
  };

  const handleSprintDatesChange = (dates) => {
    setSprintDates(dates);
  };

  const resetForm = () => {
    setProductOwner(null);
    setScrumMaster(null);
    setSelectedTeamMembers([]);
    setSprintDates([]);
    setSprintName('');
    document.getElementById("sprint-form").reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const sprintStartDate = sprintDates[0]?.format('YYYY-MM-DD');
    const sprintEndDate = sprintDates[1]?.format('YYYY-MM-DD');

    console.log("Sprint Start Date:", sprintStartDate);
    console.log("Sprint End Date:", sprintEndDate);

    // Pass the data to the script.js file or handle it here
    const event = new CustomEvent('submitSprintForm', {
      detail: {
        sprintName,
        sprintStartDate,
        sprintEndDate,
        productOwner,
        scrumMaster,
        selectedTeamMembers
      }
    });
    document.dispatchEvent(event);

    closeAddSprintForm(resetForm);
  };

  if (teamMembers.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="add-sprint-form" id="add-sprint-form">
      <div className="popup-content">
        <button className="close-popup" onClick={() => closeAddSprintForm(resetForm)}>x</button>
        <h2>Sprint Form</h2>
        <form id="sprint-form" onSubmit={handleSubmit}>
          <label htmlFor="sprint-name">Sprint Name</label>
          <input type="text" id="sprint-name" value={sprintName} onChange={(e) => setSprintName(e.target.value)} required />

          <label htmlFor="sprint-dates">Sprint Dates</label>
          <Space direction="vertical" size={12}>
            <RangePicker
              id="sprint-dates"
              onChange={handleSprintDatesChange}
              value={sprintDates}
            />
          </Space>

          <label htmlFor="choose-product-owner">Choose Product Owner</label>
          <Select
            id="choose-product-owner"
            style={{ width: '100%' }}
            placeholder="Select Product Owner"
            value={productOwner}
            onChange={handleProductOwnerChange}
            required
          >
            {teamMembers
              .filter(member => member !== scrumMaster)
              .map(member => (
                <Option key={member} value={member}>{member}</Option>
              ))}
          </Select>

          <label htmlFor="choose-scrum-master">Choose Scrum Master</label>
          <Select
            id="choose-scrum-master"
            style={{ width: '100%' }}
            placeholder="Select Scrum Master"
            value={scrumMaster}
            onChange={handleScrumMasterChange}
            required
          >
            {teamMembers
              .filter(member => member !== productOwner)
              .map(member => (
                <Option key={member} value={member}>{member}</Option>
              ))}
          </Select>

          <label htmlFor="choose-team-members">Choose Team Members</label>
          <Select
            id="choose-team-members"
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select Team Members"
            value={selectedTeamMembers}
            onChange={handleTeamMembersChange}
            required
          >
            {teamMembers.map(member => (
              <Option key={member} value={member}>{member}</Option>
            ))}
          </Select>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

const closeContributionTimeMembersPopup = () => {
  const form = document.getElementById('contribution-time-popup');
  if (form) {
    form.style.display = 'none';
  }
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
};

const ContributionTimeForm = () => {
  const [contributionDates, setContributionDates] = useState([]);

  const handleContributionDatesChange = (dates) => {
    setContributionDates(dates);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const contributionStartDate = contributionDates[0]?.format('YYYY-MM-DD');
    const contributionEndDate = contributionDates[1]?.format('YYYY-MM-DD');

    console.log("Contribution Start Date:", contributionStartDate);
    console.log("Contribution End Date:", contributionEndDate);

    // Call the showContributionTime function with the selected dates
    showContributionTime(contributionStartDate, contributionEndDate);

    closeContributionTimeMembersPopup();
  };

  return (
    <div className="contribution-time-popup" id="contribution-time-popup">
      <button className="close-popup" onClick={closeContributionTimeMembersPopup}>x</button>
      <div id="contribution-time-popup-title">Choose A Period Of Time</div>
      <form id="contribution-time-form" onSubmit={handleSubmit}>
        <Space direction="vertical" size={12}>
          <RangePicker
            id="contribution-dates"
            onChange={handleContributionDatesChange}
            value={contributionDates}
          />
        </Space>
        <button type="submit" id="set-contribution-period">
          Set Time
        </button>
      </form>
    </div>
  );
};

export { SprintForm, ContributionTimeForm };

// Mount the SprintForm component to a specific DOM element
const mountNode = document.getElementById('react-root');
if (mountNode) {
  ReactDOM.render(<SprintForm />, mountNode);
}

// Mount the ContributionTimeForm component to a specific DOM element
const contributionTimeNode = document.getElementById('contribution-time-root');
if (contributionTimeNode) {
  ReactDOM.render(<ContributionTimeForm />, contributionTimeNode);
}