const Person = ({ person, deletePerson, editPerson }) => {
    return (
      <li>
        {person.name} {person.number}
        <button onClick={() => editPerson(person)}>edit</button>
        <button onClick={() => deletePerson(person.id)}>delete</button>
      </li>
    );
  };
  
  export default Person;
  