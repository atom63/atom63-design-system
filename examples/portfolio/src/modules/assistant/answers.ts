import { projects } from '../../content/projects'
import { resume } from '../../content/resume'
import { posts } from '../../content/writing'
import { portfolio } from '../../portfolio.config'

const { email, location, name, role } = portfolio.person
const firstName = name.split(' ')[0]

const has = (question: string, ...words: string[]) => words.some(word => question.includes(word))

/* Words too common to pick out one project. */
const common = new Set(['design', 'about', 'which', 'there', 'where', 'their'])

/**
 * The offline responder's brain: it answers from the site's own content, with
 * no model and no API key. Replace the transport (see transport.ts) to answer
 * with a real model instead; this file can then go.
 */
export function answerFromContent(rawQuestion: string): string {
  const question = rawQuestion.toLowerCase()

  const project = projects.find(item =>
    item.title
      .toLowerCase()
      .split(/\W+/)
      .some(word => word.length > 4 && !common.has(word) && question.includes(word))
  )
  if (project) {
    return `${project.title} (${project.timeline}). ${project.summary} ${firstName} was ${project.role.toLowerCase()}, with ${project.team}. The case study is at /projects/${project.slug}.`
  }

  if (has(question, 'contact', 'email', 'hire', 'reach', 'touch', 'available')) {
    return `The best way to reach ${firstName} is by email: ${email}. ${firstName} is based in ${location}.`
  }

  if (has(question, 'project', 'work', 'portfolio', 'case stud', 'built', 'shipped')) {
    const list = projects.map(item => `• ${item.title}: ${item.summary}`).join('\n')
    return `${firstName} has ${projects.length} case studies here:\n${list}\nAsk about any of them for more.`
  }

  if (has(question, 'experience', 'resume', 'cv', 'job', 'career', 'company', 'role')) {
    const roles = resume.experience.map(item => `• ${item.title} at ${item.company}`).join('\n')
    return `${resume.summary}\n${roles}\nThe full resume is at /resume.`
  }

  if (has(question, 'skill', 'tool', 'stack', 'good at')) {
    return `${firstName}'s skills: ${resume.skills.join(', ')}.`
  }

  if (has(question, 'writ', 'blog', 'post', 'article')) {
    const list = posts.map(post => `• ${post.title}: ${post.description}`).join('\n')
    return `Recent writing:\n${list}\nAll posts are at /writing.`
  }

  if (has(question, 'who', 'about', 'yourself', 'hello', 'hi ')) {
    return `${name} is a ${role.toLowerCase()} based in ${location}. ${portfolio.person.intro}`
  }

  return `I answer from this site's content, so I know about ${firstName}'s projects, experience, skills, writing and how to get in touch. Try one of those.`
}
