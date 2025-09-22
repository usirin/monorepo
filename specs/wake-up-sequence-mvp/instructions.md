# Wake-Up Sequence MVP - Instructions

## Project Context

Building an interactive personal portfolio experience for Umut Sirin that tells his authentic story as an autistic software engineer with ADHD. This is deeply personal storytelling through interactive 3D web experience.

## MVP Scope: Wake-Up Sequence

### Core Vision
**"What does it feel like to wake up as Umut?"** - A 90-second interactive sequence that creates genuine empathy and understanding.

### Personal Context
- Umut has Asperger's syndrome (autism) and ADHD
- Every decision is a struggle due to masking and neurodivergent thinking
- This is his authentic story: "decision making is hard", "everyday is a struggle because i have to mask, to even myself"
- Goal: Help people understand how Umut specifically experiences life
- Not representing all neurodivergent people - just Umut's specific experience

### User Stories

**As a visitor**, I want to:
- Experience what it's like to wake up in Umut's mind
- Feel the vulnerability and necessity of putting on glasses
- Understand the weight of simple morning decisions
- Connect emotionally with Umut's daily reality
- Leave wanting to experience more of his story

**As Umut**, I want to:
- Share my authentic morning experience
- Show the blur-to-clarity struggle I face daily
- Help people understand my specific reality
- Create empathy without glorifying the difficulty
- Validate my experience through authentic representation

### The 90-Second Experience Flow

#### Act 1: Vulnerable Awakening (0-20s)
- **Scene**: Umut's bedroom corner, morning light
- **State**: Everything is blurred, disorienting
- **Emotion**: Vulnerability, "something's not right"
- **Audio**: Muffled, distant sounds
- **Interaction**: None - just experience the discomfort

#### Act 2: The Reach for Clarity (20-45s)
- **Focus**: Hand reaching toward glasses on nightstand
- **Interaction**: Mouse guides the reach (slight resistance showing effort)
- **Emotion**: Necessity, habitual struggle
- **Visual**: Realistic bedroom sounds, natural morning environment

#### Act 3: Clarity and Reality (45-70s)
- **Interaction**: Click to put glasses on
- **Effect**: World transforms from blur to overwhelming sharp detail
- **Emotion**: Relief mixed with "now I can see... and it's a lot"
- **Visual**: Colors saturate, details emerge, maybe some overwhelm

#### Act 4: The Weight of Choice (70-90s)
- **Scene**: Clear view of morning possibilities
- **Elements**: Phone on nightstand, bathroom door, other morning choices
- **Emotion**: Decision fatigue before day even starts
- **Interaction**: Gentle awareness of choices, no pressure
- **Ending**: Fade to "Episode 1 coming soon..." with Umut's credit

### Authentic Environmental Details

#### Bedroom Setting
- **Corner focus**: Nightstand area, not full room invasion
- **Morning light**: Realistic window placement, natural shadows
- **Personal items**: Glasses (exact placement), phone (habitual spot), water glass
- **Organization**: Shows Umut's systems for managing daily needs
- **Brother hint**: Maybe photo on nightstand (subtle, respectful)

#### Technical Experience
- **Platform**: Web-based, React Three Fiber
- **Duration**: 90 seconds total
- **Performance**: 60fps, <3s load time
- **Accessibility**: Keyboard navigation, customizable sensory levels

### Success Criteria

#### Emotional Validation
- User completes sequence without prompting
- User asks questions about Umut afterward
- User wants to share the experience
- User remembers it days later
- User cares about Umut's morning after 90 seconds

#### Technical Validation
- 90%+ completion rate
- Smooth blur-to-clarity transition
- Responsive, satisfying interactions
- No performance issues
- Works on modern browsers/devices

### Key Constraints

#### Authenticity Requirements
- **Specific to Umut**: Not generic neurodivergent experience
- **Honest difficulty**: Show struggle without romanticizing
- **Personal details**: Umut's actual morning routine elements
- **No assumptions**: Based only on Umut's shared experiences
- **Respectful intimacy**: Authentic but not invasive

#### Technical Constraints
- **No limits approach**: Latest browsers, good computers preferred
- **IMAX cinema quality**: Premium experience over broad compatibility
- **Learning experience**: Pushing technical boundaries acceptable
- **Bundle size**: Emotional impact > optimization concerns

### Future Episodes Context
This MVP validates the concept for a larger episodic experience:
- **Shared opening**: Wake up → glasses → phone grab (becomes familiar ritual)
- **Episode 1**: "The Exercise Discovery" (bathroom routine, brother text)
- **Episode 2**: "Coffee, Huskies & Choices" (kitchen ritual, dog chaos)
- **Episode 3**: "Building Binclusive" (working with brother)

### Awards and Recognition Goals
- Design community recognition
- Technical innovation showcase
- Authentic neurodivergent representation
- Personal portfolio that stands out
- Foundation for potential open-source platform

## Acceptance Criteria

### Must Have
- [ ] 90-second interactive wake-up sequence
- [ ] Blur-to-clarity glasses transition
- [ ] 4 key interaction moments
- [ ] Authentic bedroom corner environment
- [ ] Emotional impact validation
- [ ] 60fps performance
- [ ] Completion tracking

### Should Have
- [ ] Contextual audio design
- [ ] Smooth camera movements
- [ ] Realistic lighting progression
- [ ] Personal environmental details
- [ ] Accessibility considerations

### Could Have
- [ ] Subtle brother photo reference
- [ ] Advanced post-processing effects
- [ ] Haptic feedback (if available)
- [ ] Eye tracking integration (if available)

## Technical Environment
- **Location**: `/services/rsbuild-lab/`
- **Stack**: React, TypeScript, React Three Fiber, Effect
- **Tools**: Rsbuild, modern web APIs
- **Target**: Latest browsers, good hardware

## Team Collaboration Context
This specification emerged from deep collaboration between:
- Apple PM (product vision)
- Pixar Visual Director (emotional storytelling)
- UX Designer (interaction flow)
- Visual Designer (authentic aesthetics)
- Performance Engineer (technical excellence)
- Systems Architect (expandable foundation)

The focus is **Umut's authentic story first**, technical platform considerations second.
