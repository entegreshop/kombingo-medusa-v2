import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex items-center justify-between border border-gray-200 p-6 rounded-lg">
      <div>
        <Heading level="h2" className="text-lg font-semibold text-black">
          Zaten hesabınız var mı?
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-1">
          Daha iyi bir sipariş deneyimi için giriş yapın.
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10 border border-gray-200 bg-white hover:bg-gray-50 text-black px-6 rounded-md font-medium" data-testid="sign-in-button">
            Giriş Yap
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
