const PersonForm = ({ newName, newNumber, handleNameChange, handleNumberChange, addPerson }) => {
  // Client-side validation for phone number
  const validatePhoneNumber = (number) => {
    if (!number) return { isValid: false, message: '' };
    
    if (number.length < 8) {
      return { isValid: false, message: 'Phone number must be at least 8 characters long' };
    }
    
    const parts = number.split('-');
    if (parts.length !== 2) {
      return { isValid: false, message: 'Phone number must contain exactly one hyphen (e.g., 09-1234556)' };
    }
    
    const firstPart = parts[0];
    const secondPart = parts[1];
    
    if (!/^\d+$/.test(firstPart) || !/^\d+$/.test(secondPart)) {
      return { isValid: false, message: 'Both parts must contain only digits' };
    }
    
    if (firstPart.length < 2 || firstPart.length > 3) {
      return { isValid: false, message: 'First part must have 2 or 3 digits' };
    }
    
    return { isValid: true, message: 'Valid phone number format' };
  };

  const phoneValidation = validatePhoneNumber(newNumber);
  const isFormValid = newName.length >= 3 && phoneValidation.isValid;

  return (
    <form onSubmit={addPerson}>
      <div>
        name: <input value={newName} onChange={handleNameChange} />
        {newName.length > 0 && newName.length < 3 && (
          <div style={{ color: 'red', fontSize: '12px' }}>
            Name must be at least 3 characters long
          </div>
        )}
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNumberChange} />
        {newNumber.length > 0 && !phoneValidation.isValid && (
          <div style={{ color: 'red', fontSize: '12px' }}>
            {phoneValidation.message}
          </div>
        )}
        {newNumber.length > 0 && phoneValidation.isValid && (
          <div style={{ color: 'green', fontSize: '12px' }}>
            {phoneValidation.message}
          </div>
        )}
        <div style={{ fontSize: '12px', color: 'gray' }}>
          Format: XX-XXXXXXX or XXX-XXXXXXX (e.g., 09-1234556, 040-22334455)
        </div>
      </div>
      <div>
        <button type="submit" disabled={!isFormValid}>add</button>
      </div>
    </form>
  );
};
  
  export default PersonForm;
  