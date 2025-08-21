import { useState } from 'react'

const StatisticLine = props =>   
<tr>
  <td>{props.text}</td>
  <td>{props.value}</td>
</tr>

const Statistics = (props) => {
  
  const total = props.good + props.neutral + props.bad
  const average = total === 0 ? 0 : (props.good - props.bad) / total
  const positive = total === 0 ? 0 : (props.good / total) * 100
  if (props.good == 0 && props.neutral == 0 && props.bad == 0) {
    return <div>No feedback given</div>;
  }
  else {
  return (
    <>
      <h2>statistics</h2>
      <table>
          <tbody>
            <StatisticLine text="good" value={props.good} />
            <StatisticLine text="neutral" value={props.neutral} />
            <StatisticLine text="bad" value={props.bad} />
            <StatisticLine text="average" value={average} />
            <StatisticLine text="positive" value={`${positive} %`} />
          </tbody>
        </table>

    </>
  )
}
}

const Button = (props) => (
  <button onClick={props.handleClick}>
    {props.text}
  </button>
)

const App = () => {
  // Save the state for each feedback type
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)


  return (
    <>
      <h1>give feedback</h1>
      <Button handleClick={() => setGood(good + 1)} text="good" />
      <Button handleClick={() => setNeutral(neutral + 1)} text="neutral" />
      <Button handleClick={() => setBad(bad + 1)} text="bad" />
      <Statistics good={good} bad={bad} neutral={neutral}/>

    </>
  )
}

export default App
