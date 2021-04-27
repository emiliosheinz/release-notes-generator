function byRepository(card, repository) {
  if (repository) {
    return card.repository.toLowerCase() === repository.toLowerCase()
  }

  return true
}

function byLabel(card, label) {
  if (label) {
    return card.labels.some(e => e.name.toLowerCase() === label.toLowerCase())
  }

  return true
}

function byMilestone(card, milestone) {
  if (milestone) {
    return card.milestone === milestone
  }

  return true
}

module.exports = {
  byLabel,
  byMilestone,
  byRepository,
}
