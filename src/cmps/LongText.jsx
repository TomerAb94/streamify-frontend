import { useState } from 'react'

export function LongText({ txt, length = 300 }) {
  

  const [isExpended, setIsExpended] = useState(false)
  
  const cleanText = txt ? txt.replace(/\n\s*\n/g, ' ') : ''
  // console.log(cleanText)
  return (
    <p className="long-text">
      {isExpended ? cleanText : cleanText.substring(0, length)}
      <span
        className="show-more-less"
        onClick={() => setIsExpended(!isExpended)}
      >
        {isExpended ? ' Show less' : ' Show more...'}
      </span>
    </p>
  )
}
