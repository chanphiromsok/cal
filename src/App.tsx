import { Trans } from '@lingui/react/macro'
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes'
import React, { useState } from 'react'
import './App.css'
import reactLogo from './assets/react.svg'
import BottomSheet, { type BottomSheetRef } from './components/BottomSheet'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  const bottomSheetRef = React.useRef<BottomSheetRef>(null);
  return (
    <Box p="4" style={{ minHeight: '100vh' }}>
      <Flex direction="column" align="center" gap="4">
        <LanguageSwitcher />

        <Flex gap="4" align="center">
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </Flex>

        <Heading size="8">
          <Trans>Vite + React</Trans>
        </Heading>

        <Card size="3" style={{ width: '100%', maxWidth: '400px' }}>
          <Flex direction="column" gap="3" align="center">
            <Button size="3" onClick={() => setCount((count) => count + 1)}>
              <Trans>count is {count}</Trans>
            </Button>

            <Text size="2" color="gray">
              <Trans>
                Edit <code>src/App.tsx</code> and save to test HMR
              </Trans>
            </Text>

            <Button
              variant="outline"
              size="3"
              onClick={() => {
                bottomSheetRef.current?.open();
              }}
            >
              <Trans>Open Bottom Sheet</Trans>
            </Button>
          </Flex>
        </Card>

        <Text size="2" color="gray" align="center">
          <Trans>Click on the Vite and React logos to learn more</Trans>
        </Text>
      </Flex>

      <BottomSheet
        ref={bottomSheetRef}
        onClose={() => setIsBottomSheetOpen(false)}
        snapPoints={[0.3, 0.6, 0.95]}

      >
        <Flex direction="column" gap="4" p="4">
          <Heading size="6">
            <Trans>Bottom Sheet Demo</Trans>
          </Heading>

          <Text>
            <Trans>This is a native-like bottom sheet component built with React Spring and Radix UI.</Trans>
          </Text>

          <Flex direction="column" gap="2">
            <Text weight="bold">
              <Trans>Features:</Trans>
            </Text>
            <Text size="2">• <Trans>Drag to dismiss</Trans></Text>
            <Text size="2">• <Trans>Multiple snap points (30%, 60%, 95%)</Trans></Text>
            <Text size="2">• <Trans>Smooth spring animations</Trans></Text>
            <Text size="2">• <Trans>Mobile optimized with safe areas</Trans></Text>
            <Text size="2">• <Trans>Touch gesture support</Trans></Text>
            <Text size="2">• <Trans>Dynamic viewport height support</Trans></Text>
            <Text size="2">• <Trans>Scrollable content area</Trans></Text>
            <Text size="2">• <Trans>Backdrop click to close</Trans></Text>
          </Flex>

          <Flex direction="column" gap="2">
            <Text weight="bold">
              <Trans>Test Content:</Trans>
            </Text>
            {Array.from({ length: 20 }, (_, i) => (
              <Card key={i} size="1">
                <Text size="2">
                  <Trans>Content item {i + 1} - This is scrollable content to test the full height expansion of the bottom sheet.</Trans>
                </Text>
              </Card>
            ))}
          </Flex>

          <Button
            variant="solid"
            onClick={() => setIsBottomSheetOpen(false)}
          >
            <Trans>Close</Trans>
          </Button>
        </Flex>
      </BottomSheet>
    </Box>
  )
}

export default App
