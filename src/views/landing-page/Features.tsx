// import {  } from 'lucide-react'

import { User, Code, MessageCircle, Video } from "lucide-react";

const features = [
  {
    name: "Pair Programming",
    description:
      "A live, interactive pair programming environment where students can collaboratively code in real-time.",
    benefits:
      "Enhances learning through collaboration, sharing knowledge, and cooperative problem-solving.",
    icon: User,
  },
  {
    name: "Interactive Coding",
    description:
      "A platform for writing, executing, and sharing code in real-time.",
    benefits:
      "Accelerates learning and troubleshooting by providing immediate feedback on code.",
    icon: Code,
  },
  //   {
  //     name: "Real-time Feedback",
  //     description:
  //       "Provides immediate feedback within the coding session, highlighting errors and suggesting improvements.",
  //     benefits:
  //       "Supports faster learning and correction, enhancing coding proficiency.",
  //     icon: MessageCircle,
  //   },
  {
    name: "Generative AI Facilitator",
    description:
      "Integrates generative AI to assist in code generation and solution exploration, offering suggestions and optimizations.",
    benefits:
      "Augments coding sessions with AI-powered insights, reducing development time and improving code quality.",
    icon: Video,
  },
];

export default function Features() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">
            Collaborate Better
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Enhance your coding experience with real-time collaboration
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Discover the power of pair programming with our interactive
            platform. Connect, code, and create together, anytime, anywhere.
            Transform how you learn and develop software with peer insights and
            real-time feedback.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <feature.icon
                    className="h-5 w-5 flex-none text-indigo-400"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                  {/* <p className="mt-6">
                    <a href={feature.href} className="text-sm font-semibold leading-6 text-indigo-400">
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p> */}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
