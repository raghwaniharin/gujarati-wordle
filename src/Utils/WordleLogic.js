import { gujaratiBarakhadi } from '../constants/gujaratiletters';

// Helper: get Barakhadi id from consonant and vowel ids
export function getBarakhadiId(consonantId, vowelId) {
  // Vowel ids are 1-12, consonant blocks start at 13 and increment by 12
  // Find the base index for the consonant block
  if (consonantId < 13 || vowelId < 1 || vowelId > 12) return null;
  const blockStart = consonantId;
  const offset = vowelId - 1;
  const combinedId = blockStart + offset;
  // Validate existence
  const found = gujaratiBarakhadi.find(l => l.id === combinedId);
  return found ? combinedId : null;
}

// Create reverse mapping: id → letter
const idLetterMap = gujaratiBarakhadi.reduce((map, obj) => {
  map[obj.id] = obj.gu;
  return map;
}, {});

export function getWordleFeedback(guess, target) {
  const guessArr = [...guess];
  const targetArr = [...target];
  
  const feedback = new Array(guessArr.length).fill(null);
  const matchedIndices = new Set();

  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] === targetArr[i]) {
      feedback[i] = 'green';
      matchedIndices.add(i);
    }
  }

  for (let i = 0; i < guessArr.length; i++) {
    if (feedback[i] === null) {
      let foundIndex = -1;
      for (let j = 0; j < targetArr.length; j++) {
        if (!matchedIndices.has(j) && guessArr[i] === targetArr[j]) {
          foundIndex = j;
          break;
        }
      }
      feedback[i] = foundIndex !== -1 ? 'yellow' : 'grey';
      if (foundIndex !== -1) matchedIndices.add(foundIndex);
    }
  }

  return guessArr.map((id, i) => ({
    letter: idLetterMap[id] || '?',
    color: feedback[i]
  }));
}
