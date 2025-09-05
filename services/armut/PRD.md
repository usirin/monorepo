# Financial Chat App - PRD

## Problem
Need instant access to family financial data without manual analysis or complex interfaces.

## Solution
Local web app that syncs all transactions and provides conversational interface to query spending history.

## Core User Flow
1. Open localhost app
2. Type natural language question about spending
3. Get immediate, accurate answer
4. Ask follow-up questions with maintained context

## Key Features

### Data Pipeline
- **SimpleFIN Integration**: Automatic transaction sync from all accounts
- **PostgreSQL Storage**: Persistent transaction history
- **Data Enrichment**: Clean merchant names, normalize descriptions

### Query Interface
- **Text-to-SQL Agent**: Local model converts questions to SQL queries
- **Claude Orchestration**: Manages conversation, formats responses
- **Context Retention**: Remembers conversation history for follow-ups

### Chat Interface
- **Clean UI**: Simple chat interface, no clutter
- **Fast Responses**: Sub-2 second query responses
- **Natural Language**: Understands dates, amounts, merchant variations

## Technical Architecture

```
SimpleFIN API → PostgreSQL → Text-to-SQL Agent → Claude API → Chat UI
```

### Core Components
1. **Backend API**: Node.js/Express server
2. **Database**: PostgreSQL with optimized transaction schema
3. **SQL Agent**: Local model for query generation
4. **Frontend**: React chat interface
5. **LLM Integration**: Claude API for orchestration

## Success Metrics
- Query response time < 2 seconds
- Accurate answers to common spending questions
- Successful conversation context retention
- Daily active usage by family members

## Example Interactions
- "How much did we spend on groceries last month?" → "$847 in October 2024"
- "What about restaurants?" → "$423 on dining out in October"
- "Show me all Target purchases this year" → List with dates and amounts

## Technical Requirements
- Runs entirely on localhost
- No external dependencies except SimpleFIN and Claude API
- Handles multiple family accounts simultaneously
- Maintains complete transaction history

## Out of Scope (V1)
- Budgeting or financial planning features
- Data visualization/charts
- Mobile app
- Multi-user authentication
- External integrations beyond SimpleFIN