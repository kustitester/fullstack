import Person from './Person';

const Persons = ({ persons, deletePerson, editPerson }) => {
  return (
    <ul>
      {persons.map((person, index) => (
        <Person key={index} person={person} deletePerson={deletePerson} editPerson={editPerson} />
      ))}
    </ul>
  );
};

export default Persons;
