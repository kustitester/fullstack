import { useState, useEffect } from 'react';
import personsService from './services/persons';
import Filter from './components/Filter';
import PersonForm from './components/PersonForm';
import Persons from './components/Persons';
import Notification from './components/Notification';

const App = () => {
  const [persons, setPersons] = useState([]); 
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ message: null, type: 'success' });

  useEffect(() => {
    personsService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons);
      });
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: null, type: 'success' });
    }, 5000);
  };

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const addPerson = (event) => {
    event.preventDefault();
    const existingPerson = persons.find(person => person.name === newName);
    
    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const changedPerson = { ...existingPerson, number: newNumber };
        
        // Use _id if available, otherwise fall back to id
        const personId = existingPerson._id || existingPerson.id;
        
        if (!personId) {
          showNotification(`Error: Could not find ID for ${newName}`, 'error');
          return;
        }
        
        personsService
          .update(personId, changedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => (p._id || p.id) !== personId ? p : returnedPerson));
            setNewName('');
            setNewNumber('');
            showNotification(`${newName} updated successfully`);
          })
          .catch(error => {
            // Handle validation errors from the server
            let errorMessage = `Error updating ${newName}`;
            if (error.response && error.response.data) {
              if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
              } else if (error.response.data.error) {
                errorMessage = error.response.data.error;
              } else {
                errorMessage = JSON.stringify(error.response.data);
              }
            }
            showNotification(errorMessage, 'error');
          });
      }
    } else {
      const newPerson = {
        name: newName,
        number: newNumber
      };
      
      personsService
        .create(newPerson)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson));
          setNewName('');
          setNewNumber('');
          showNotification(`${newName} added successfully`);
        })
        .catch(error => {
          // Handle validation errors from the server
          let errorMessage = `Error adding ${newName}`;
          if (error.response && error.response.data) {
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (error.response.data.error) {
              errorMessage = error.response.data.error;
            } else {
              errorMessage = JSON.stringify(error.response.data);
            }
          }
          showNotification(errorMessage, 'error');
        });
    }
  };

  const deletePerson = (id) => {
    const person = persons.find(p => (p._id || p.id) === id);
    if (window.confirm(`Delete ${person.name}?`)) {
      personsService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => (p._id || p.id) !== id));
          showNotification(`${person.name} deleted successfully`);
        })
        .catch(error => {
          showNotification(
            `the person '${person.name}' was already deleted from server`,
            'error'
          );
          setPersons(persons.filter(p => (p._id || p.id) !== id));
        });
    }
  };

  const editPerson = (person) => {
    const newNumber = prompt(`Enter new number for ${person.name}:`, person.number);
    if (newNumber !== null && newNumber !== person.number) {
      const changedPerson = { ...person, number: newNumber };
      const personId = person._id || person.id;
      
      if (!personId) {
        showNotification(`Error: Could not find ID for ${person.name}`, 'error');
        return;
      }
      
      personsService
        .update(personId, changedPerson)
        .then(returnedPerson => {
          setPersons(persons.map(p => (p._id || p.id) !== personId ? p : returnedPerson));
          showNotification(`${person.name} updated successfully`);
        })
        .catch(error => {
          // Handle validation errors from the server
          let errorMessage = `the person '${person.name}' was already deleted from server`;
          if (error.response && error.response.data) {
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (error.response.data.error) {
              errorMessage = error.response.data.error;
            } else {
              errorMessage = JSON.stringify(error.response.data);
            }
          }
          showNotification(errorMessage, 'error');
          if (!error.response || !error.response.data) {
            setPersons(persons.filter(p => (p._id || p.id) !== personId));
          }
        });
    }
  };

  const personsToShow = persons.filter(person => 
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook Final</h2>
      <Notification message={notification.message} type={notification.type} />
      <Filter searchTerm={searchTerm} handleSearchChange={handleSearchChange} />
      <PersonForm 
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />
      <h2>Numbers</h2>
      <Persons persons={personsToShow} deletePerson={deletePerson} editPerson={editPerson} />
    </div>
  );
};

export default App;
