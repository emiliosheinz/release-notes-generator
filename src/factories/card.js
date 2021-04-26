export function cardFactory(object) {
  if (!object) {
    return null
  }

  return {
    number: object.number,
    title: object.title,
    labels: object.labels,
    milestone: object.milestone?.title || '',
  }
}
