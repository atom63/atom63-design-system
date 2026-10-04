import { Button } from '../components/ui'

export function Import({ onDone }: { onDone: () => void }) {
  return <Button onClick={onDone}>Back</Button>
}
