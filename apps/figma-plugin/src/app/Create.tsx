import { Button } from '../components/ui'

export function Create({ onDone }: { onDone: () => void }) {
  return <Button onClick={onDone}>Back</Button>
}
