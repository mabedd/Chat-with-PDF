import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import { ChatOpenAI } from '@langchain/openai'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const question = formData.get('question') as string

    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded.' },
        { status: 400 }
      )
    }

    // Convert File to ArrayBuffer and then to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Parse the PDF file to extract text
    const pdfData = await pdfParse(fileBuffer)
    const extractedText = pdfData.text

    // Process the extracted text and the question using LangChain
    const answer = await processWithLangChain(extractedText, question)

    // Send the response back
    return NextResponse.json({ answer }, { status: 200 })
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json(
      { message: 'An error occurred while processing the PDF.' },
      { status: 500 }
    )
  }
}

async function processWithLangChain(
  text: string,
  question: string
): Promise<string> {
  try {
    const chat = new ChatOpenAI({
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    })

    const response = await chat.invoke([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: `Here is the context: ${text}` },
      { role: 'user', content: question },
    ])

    if (Array.isArray(response.content)) {
      return (
        response.content
          .map((item) => {
            if (typeof item === 'string') {
              return item
            } else if ('text' in item) {
              return item.text
            } else {
              return ''
            }
          })
          .join(' ') || 'No response generated'
      )
    }

    return typeof response.content === 'string'
      ? response.content
      : 'No response generated'
  } catch (error) {
    console.error('Error processing with LangChain:', error)
    throw new Error('LangChain processing failed.')
  }
}
