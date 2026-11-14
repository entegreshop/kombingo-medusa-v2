import { Text } from "@medusajs/ui"

const MedusaCTA = () => {
  return (
    <Text className="flex gap-x-1.5 txt-compact-small-plus items-center text-ui-fg-muted">
      Powered by
      <a
        href="https://entegreshop.com"
        target="_blank"
        rel="noreferrer"
        className="font-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors inline-flex items-center gap-1"
      >
        <span>entegreshop</span>
      </a>
    </Text>
  )
}

export default MedusaCTA
