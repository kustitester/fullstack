const Course = ({course}) => {
    
    
      const Header = (props) =>{
        return (
          <div>
            <h1>
              {props.course.name}
            </h1>
          </div>
        )
      }
      const Part = (props) => {
        return(
        <>
          <p>
            {props.name} {props.exercises}
          </p>
        </>
        )
      }
      
      const Content = (props) => {
        return (
          <div>
            {props.course.parts.map((part, index) => (
              <Part key={index} name={part.name} exercises={part.exercises} />
            ))}
          </div>
        )
      }
      
      const Total = (props) => {
        const parts = props.course.parts;

        const totalExercises = parts.map(part => part.exercises).reduce((sum, exercises) => sum + exercises, 0);
        
        return (
          <p>Number of exercises {totalExercises}</p>
        );
        
      }
    
      return (
        <div>
          <Header course={course} />
          <Content course={course} />
          <Total course={course} />
        </div>
      )
    }
    
    export default Course

