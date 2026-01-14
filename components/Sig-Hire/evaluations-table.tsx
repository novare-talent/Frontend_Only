import { useState } from 'react';
import { ExternalLink, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface AssignmentEvaluationScreenProps {
  onApprove: () => void;
}

interface Scores {
  logic: number;
  correctness: number;
  clarity: number;
  originality: number;
}

const mockSubmissions = [
  {
    id: '1',
    candidate: 'Serena Williams',
    submittedAt: 'Submitted at 17:00 IST',
    repoUrl: 'github.com/sarachen/auth-api',
  },
  {
    id: '2',
    candidate: 'John Cena',
    submittedAt: 'Submitted at 20:08 IST',
    repoUrl: 'github.com/mrodriguez/jwt-auth',
  },
];

export function AssignmentEvaluationScreen({ onApprove }: AssignmentEvaluationScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Scores>({
    logic: 8,
    correctness: 9,
    clarity: 8,
    originality: 7,
  });

  const currentSubmission = mockSubmissions[currentIndex];
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 4;

  const updateScore = (category: keyof Scores, value: number) => {
    setScores({ ...scores, [category]: Math.max(0, Math.min(10, value)) });
  };

  const nextSubmission = () => {
    if (currentIndex < mockSubmissions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSubmission = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-primary font-semibold tabular-nums @[250px]/card:text-2xl py-2 px-1">Assignment Evaluation</h2>
          <p className="text-muted-foreground text-sm px-1">
            Review and score candidate submissions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={prevSubmission}
            disabled={currentIndex === 0}
            className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-muted-foreground px-3">
            {currentIndex + 1} of {mockSubmissions.length}
          </span>
          <button
            onClick={nextSubmission}
            disabled={currentIndex === mockSubmissions.length - 1}
            className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Score Summary Bar */}
      <div className="mb-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-1 font-semibold text-2xl">{currentSubmission.candidate}</h2>
            <p className="text-sm text-muted-foreground">Submitted {currentSubmission.submittedAt}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl text-primary mb-1">{totalScore.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Overall Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left: Submission */}
        <div>
          <h3 className="text-lg font-medium text-primary mb-4 px-1">Submission</h3>
          
          <div className="bg-card border border-border rounded-xl p-6 mb-4 shadow-card">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <div>
                <h4 className="mb-1">Code Repository</h4>
                <p className="text-sm text-muted-foreground">{currentSubmission.repoUrl}</p>
              </div>
              <a
                href={`https://${currentSubmission.repoUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-border rounded-lg hover:bg-muted"
              >
                <ExternalLink className="w-5 h-5 text-muted-foreground" />
              </a>
            </div>

                <h5 className="mb-3">Code Preview</h5>
                <div className="bg-foreground/95 text-background p-4 rounded-lg text-xs font-mono overflow-x-auto">
                  {/*EXAMPLE CODE */}
                  <pre className="text-muted">{`// auth.controller.ts
async login(req: Request, res: Response) {
  const { email, password } = req.body;
  
  const user vscdfsbvdfb= await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }
  dsxvcsdvfv
  const isValthgr wthrw tid = await bcrypt.compare(
    password,
    user.passwordHash
  );
  sfverhtrhjyjj5y
  if (!isValid) {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }
  
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return res.json({ token });
}`}</pre>
                </div>
          </div>
        </div>

        {/* Right: Scoring Rubric */}
        <div>
          <h3 className="text-lg font-medium text-primary mb-4 px-1">Scoring Rubric</h3>
          
          <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-card">
            {/* Logic */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="mb-1">Logic & Problem Solving</h5>
                  <p className="text-xs text-muted-foreground">
                    Approach to solving the problem
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={scores.logic}
                    onChange={(e) => updateScore('logic', parseInt(e.target.value) || 0)}
                    className="w-14 px-2 py-1.5 border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                  />
                  <span className="text-xs text-muted-foreground">/ 10</span>
                </div>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${scores.logic * 10}%` }}
                />
              </div>
            </div>

            {/* Correctness */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="mb-1">Accuracy</h5>
                  <p className="text-xs text-muted-foreground">
                    Meets requirements and works as expected
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={scores.correctness}
                    onChange={(e) => updateScore('correctness', parseInt(e.target.value) || 0)}
                    className="w-14 px-2 py-1.5 border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                  />
                  <span className="text-xs text-muted-foreground">/ 10</span>
                </div>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${scores.correctness * 10}%` }}
                />
              </div>
            </div>

            {/* Clarity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="mb-1">Code Clarity</h5>
                  <p className="text-xs text-muted-foreground">
                    Readability and organization
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={scores.clarity}
                    onChange={(e) => updateScore('clarity', parseInt(e.target.value) || 0)}
                    className="w-14 px-2 py-1.5 border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                  />
                  <span className="text-xs text-muted-foreground">/ 10</span>
                </div>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${scores.clarity * 10}%` }}
                />
              </div>
            </div>

            {/* Originality */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="mb-1">Originality</h5>
                  <p className="text-xs text-muted-foreground">
                    Creative approach and best practices
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={scores.originality}
                    onChange={(e) => updateScore('originality', parseInt(e.target.value) || 0)}
                    className="w-14 px-2 py-1.5 border border-border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                  />
                  <span className="text-xs text-muted-foreground">/ 10</span>
                </div>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${scores.originality * 10}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <label className="block text-xs mb-2">Additional Notes</label>
              <textarea
                placeholder="Add evaluation notes..."
                className="w-full h-24 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
              />
            </div>
          </div>

          <button
            onClick={onApprove}
            className="w-full mt-6 px-5 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Approve & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
