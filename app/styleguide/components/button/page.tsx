'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Mail, Loader2, ChevronRight, Plus, Download } from 'lucide-react'

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="mb-6 text-2xl font-semibold text-foreground">{title}</h2>
      {children}
      <Separator className="my-12" />
    </section>
  )
}

function ComponentPreview({
  title,
  children,
  code,
}: {
  title: string
  children: React.ReactNode
  code: string
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-6">
        {children}
      </div>
      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function PropsTable({
  props,
}: {
  props: Array<{
    name: string
    type: string
    default?: string
    description: string
  }>
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 pr-4 text-left font-medium">Prop</th>
            <th className="py-3 pr-4 text-left font-medium">Type</th>
            <th className="py-3 pr-4 text-left font-medium">Default</th>
            <th className="py-3 text-left font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b border-border">
              <td className="py-3 pr-4 font-mono text-xs text-primary">
                {prop.name}
              </td>
              <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                {prop.type}
              </td>
              <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                {prop.default ?? '-'}
              </td>
              <td className="py-3 text-muted-foreground">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ButtonPage() {
  return (
    <div className="max-w-4xl">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Button
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A clickable element that triggers an action or event.
        </p>
      </header>

      {/* What it is */}
      <Section id="overview" title="What it is">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            The Button component is used to trigger actions like submitting
            forms, opening dialogs, or navigating to different pages. It
            supports multiple variants, sizes, and can include icons.
          </p>
          <p className="text-muted-foreground">
            <strong>Use when:</strong> You need an interactive element for user
            actions like form submission, dialog triggers, or navigation.
          </p>
        </div>
      </Section>

      {/* Sub-components */}
      <Section id="sub-components" title="Sub-components">
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-medium text-foreground">Button</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              The main button component. Supports variants, sizes, and all
              native button props.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-medium text-foreground">buttonVariants</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              A function that generates button class names based on variant and
              size. Useful for styling anchor tags or other elements as buttons.
            </p>
          </div>
        </div>
      </Section>

      {/* Import */}
      <Section id="import" title="Import">
        <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
          <code>{`import { Button, buttonVariants } from '@/components/ui/button'`}</code>
        </pre>
      </Section>

      {/* Variants */}
      <Section id="variants" title="Variants">
        <div className="space-y-8">
          <ComponentPreview
            title="Default"
            code='<Button variant="default">Default</Button>'
          >
            <Button variant="default">Default</Button>
          </ComponentPreview>

          <ComponentPreview
            title="Secondary"
            code='<Button variant="secondary">Secondary</Button>'
          >
            <Button variant="secondary">Secondary</Button>
          </ComponentPreview>

          <ComponentPreview
            title="Outline"
            code='<Button variant="outline">Outline</Button>'
          >
            <Button variant="outline">Outline</Button>
          </ComponentPreview>

          <ComponentPreview
            title="Ghost"
            code='<Button variant="ghost">Ghost</Button>'
          >
            <Button variant="ghost">Ghost</Button>
          </ComponentPreview>

          <ComponentPreview
            title="Destructive"
            code='<Button variant="destructive">Destructive</Button>'
          >
            <Button variant="destructive">Destructive</Button>
          </ComponentPreview>

          <ComponentPreview
            title="Link"
            code='<Button variant="link">Link</Button>'
          >
            <Button variant="link">Link</Button>
          </ComponentPreview>
        </div>
      </Section>

      {/* Sizes */}
      <Section id="sizes" title="Sizes">
        <div className="space-y-8">
          <ComponentPreview
            title="Extra Small"
            code='<Button size="xs">Extra Small</Button>'
          >
            <Button size="xs">Extra Small</Button>
          </ComponentPreview>

          <ComponentPreview
            title="Small"
            code='<Button size="sm">Small</Button>'
          >
            <Button size="sm">Small</Button>
          </ComponentPreview>

          <ComponentPreview
            title="Default"
            code='<Button size="default">Default</Button>'
          >
            <Button size="default">Default</Button>
          </ComponentPreview>

          <ComponentPreview
            title="Large"
            code='<Button size="lg">Large</Button>'
          >
            <Button size="lg">Large</Button>
          </ComponentPreview>

          <ComponentPreview
            title="Icon Sizes"
            code={`<Button size="icon-xs"><Plus /></Button>
<Button size="icon-sm"><Plus /></Button>
<Button size="icon"><Plus /></Button>
<Button size="icon-lg"><Plus /></Button>`}
          >
            <Button size="icon-xs">
              <Plus />
            </Button>
            <Button size="icon-sm">
              <Plus />
            </Button>
            <Button size="icon">
              <Plus />
            </Button>
            <Button size="icon-lg">
              <Plus />
            </Button>
          </ComponentPreview>
        </div>
      </Section>

      {/* Props */}
      <Section id="props" title="Props">
        <PropsTable
          props={[
            {
              name: 'variant',
              type: '"default" | "secondary" | "outline" | "ghost" | "destructive" | "link"',
              default: '"default"',
              description: 'The visual style variant of the button.',
            },
            {
              name: 'size',
              type: '"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
              default: '"default"',
              description: 'The size of the button.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Whether the button is disabled.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS classes to apply.',
            },
            {
              name: 'children',
              type: 'React.ReactNode',
              description: 'The content of the button.',
            },
          ]}
        />
      </Section>

      {/* Examples */}
      <Section id="examples" title="Examples">
        <div className="space-y-8">
          <ComponentPreview
            title="With Icon (Start)"
            code={`<Button>
  <Mail data-icon="inline-start" />
  Login with Email
</Button>`}
          >
            <Button>
              <Mail data-icon="inline-start" />
              Login with Email
            </Button>
          </ComponentPreview>

          <ComponentPreview
            title="With Icon (End)"
            code={`<Button>
  Continue
  <ChevronRight data-icon="inline-end" />
</Button>`}
          >
            <Button>
              Continue
              <ChevronRight data-icon="inline-end" />
            </Button>
          </ComponentPreview>

          <ComponentPreview
            title="Loading State"
            code={`<Button disabled>
  <Loader2 className="animate-spin" />
  Please wait
</Button>`}
          >
            <Button disabled>
              <Loader2 className="animate-spin" />
              Please wait
            </Button>
          </ComponentPreview>

          <ComponentPreview
            title="Disabled"
            code="<Button disabled>Disabled</Button>"
          >
            <Button disabled>Disabled</Button>
          </ComponentPreview>

          <ComponentPreview
            title="As Link (using buttonVariants)"
            code={`// buttonVariants is a CLIENT-ONLY export — only call it inside a
// Client Component ('use client'). In a Server Component, use
// <Button asChild><Link href="...">…</Link></Button> instead, or it
// throws "Attempted to call buttonVariants() from the server" at render.
<a href="#" className={buttonVariants({ variant: "outline" })}>
  <Download />
  Download
</a>`}
          >
            <a
              href="#"
              className={buttonVariants({ variant: 'outline' })}
              onClick={(e) => e.preventDefault()}
            >
              <Download />
              Download
            </a>
          </ComponentPreview>

          <ComponentPreview
            title="All Variants Together"
            code={`<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>`}
          >
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </ComponentPreview>
        </div>
      </Section>

      {/* Notes for the AI */}
      <Section id="ai-notes" title="Notes for the AI">
        <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-6">
          <div>
            <h4 className="font-medium text-foreground">Import</h4>
            <pre className="mt-2 rounded bg-muted p-2 text-xs">
              <code>{`import { Button, buttonVariants } from '@/components/ui/button'`}</code>
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-foreground">Basic Usage</h4>
            <pre className="mt-2 rounded bg-muted p-2 text-xs">
              <code>{`<Button variant="default" size="default">
  Click me
</Button>`}</code>
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-foreground">Key Points</h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>
                Use <code className="rounded bg-muted px-1">data-icon</code>{' '}
                attribute for proper icon spacing:{' '}
                <code className="rounded bg-muted px-1">
                  data-icon=&quot;inline-start&quot;
                </code>{' '}
                or{' '}
                <code className="rounded bg-muted px-1">
                  data-icon=&quot;inline-end&quot;
                </code>
              </li>
              <li>
                Icons automatically size to 16px via{' '}
                <code className="rounded bg-muted px-1">
                  [&_svg:not([class*='size-'])]:size-4
                </code>
              </li>
              <li>
                Use <code className="rounded bg-muted px-1">buttonVariants</code>{' '}
                to style non-button elements (anchors, etc.)
              </li>
              <li>
                Available sizes:{' '}
                <code className="rounded bg-muted px-1">xs</code>,{' '}
                <code className="rounded bg-muted px-1">sm</code>,{' '}
                <code className="rounded bg-muted px-1">default</code>,{' '}
                <code className="rounded bg-muted px-1">lg</code>,{' '}
                <code className="rounded bg-muted px-1">icon</code>,{' '}
                <code className="rounded bg-muted px-1">icon-xs</code>,{' '}
                <code className="rounded bg-muted px-1">icon-sm</code>,{' '}
                <code className="rounded bg-muted px-1">icon-lg</code>
              </li>
              <li>
                Available variants:{' '}
                <code className="rounded bg-muted px-1">default</code>,{' '}
                <code className="rounded bg-muted px-1">secondary</code>,{' '}
                <code className="rounded bg-muted px-1">outline</code>,{' '}
                <code className="rounded bg-muted px-1">ghost</code>,{' '}
                <code className="rounded bg-muted px-1">destructive</code>,{' '}
                <code className="rounded bg-muted px-1">link</code>
              </li>
              <li>
                Button uses{' '}
                <code className="rounded bg-muted px-1">
                  @base-ui/react/button
                </code>{' '}
                primitive under the hood
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground">
              CSS Variables / Customization
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              The button uses semantic color tokens. Customize via className or
              by overriding CSS variables:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="rounded bg-muted px-1">--primary</code> for
                default variant background
              </li>
              <li>
                <code className="rounded bg-muted px-1">
                  --primary-foreground
                </code>{' '}
                for default variant text
              </li>
              <li>
                <code className="rounded bg-muted px-1">--destructive</code> for
                destructive variant
              </li>
              <li>
                <code className="rounded bg-muted px-1">--ring</code> for focus
                ring color
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  )
}
