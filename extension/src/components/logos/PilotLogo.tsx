type Props = { className?: string }

export const PilotLogo = ({ className }: Props) => (
  <svg
    className={className}
    viewBox="0 0 1500 492"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <mask id="hole">
        <ellipse cx="557" cy="249.017" rx="65.3649" ry="109.23" fill="white" />

        <path
          transform="rotate(327.52 557 249.017)"
          d="M579.871 199.355C587.653 176.467 586.033 176.534 570.417 199.691C550.527 229.187 525.316 259.089 502.488 263.795C500.754 264.152 498.981 264.852 501.348 266.054C508.252 269.562 521.251 279.627 517.067 304.644C515.667 313.016 519.296 312.898 526.508 304.332C548.006 278.802 571.797 267.498 582.612 263.372C586.356 261.944 585.23 261.326 583.787 261.064C565.139 257.67 569.967 228.481 579.871 199.355Z"
          fill="black"
        />
      </mask>
    </defs>

    <g transform="rotate(41.7495 557 249.017)">
      <ellipse
        cx="557"
        cy="249.017"
        rx="65.3649"
        ry="109.23"
        fill="currentColor"
        mask="url(#hole)"
      />
    </g>

    <path
      d="M747.778 286.559C756.246 286.559 763.268 283.031 768.845 275.975C774.49 268.852 777.313 258.235 777.313 244.123C777.313 235.521 776.069 228.129 773.583 221.947C768.879 210.053 760.277 204.105 747.778 204.105C735.212 204.105 726.611 210.389 721.974 222.955C719.487 229.675 718.244 238.209 718.244 248.558C718.244 256.891 719.487 263.98 721.974 269.826C726.678 280.982 735.279 286.559 747.778 286.559ZM700.806 191.304H718.446V205.617C722.075 200.712 726.039 196.915 730.34 194.227C736.455 190.195 743.646 188.179 751.911 188.179C764.141 188.179 774.524 192.883 783.058 202.291C791.592 211.632 795.86 225.004 795.86 242.409C795.86 265.929 789.711 282.729 777.413 292.809C769.618 299.193 760.546 302.385 750.198 302.385C742.066 302.385 735.246 300.604 729.735 297.042C726.51 295.026 722.915 291.566 718.95 286.66V341.797H700.806V191.304ZM808.871 191.304H827.317V298.756H808.871V191.304ZM808.871 150.682H827.317V171.245H808.871V150.682ZM847.082 150.682H865.226V298.756H847.082V150.682ZM927.124 287.063C939.153 287.063 947.385 282.527 951.82 273.455C956.323 264.316 958.574 254.169 958.574 243.014C958.574 232.934 956.961 224.736 953.735 218.419C948.628 208.473 939.825 203.501 927.326 203.501C916.238 203.501 908.174 207.734 903.134 216.201C898.094 224.668 895.574 234.883 895.574 246.844C895.574 258.335 898.094 267.911 903.134 275.572C908.174 283.233 916.171 287.063 927.124 287.063ZM927.83 187.675C941.74 187.675 953.5 192.312 963.11 201.585C972.719 210.859 977.524 224.5 977.524 242.51C977.524 259.915 973.29 274.295 964.823 285.652C956.356 297.009 943.219 302.687 925.411 302.687C910.56 302.687 898.766 297.681 890.03 287.668C881.294 277.588 876.926 264.081 876.926 247.147C876.926 229.003 881.53 214.555 890.736 203.803C899.942 193.051 912.307 187.675 927.83 187.675ZM994.567 160.661H1012.91V190.8H1030.15V205.617H1012.91V276.076C1012.91 279.839 1014.19 282.359 1016.74 283.636C1018.15 284.375 1020.51 284.745 1023.8 284.745C1024.67 284.745 1025.61 284.745 1026.62 284.745C1027.63 284.678 1028.81 284.577 1030.15 284.442V298.756C1028.07 299.361 1025.88 299.797 1023.6 300.066C1021.38 300.335 1018.96 300.469 1016.34 300.469C1007.87 300.469 1002.13 298.319 999.103 294.018C996.079 289.65 994.567 284.006 994.567 277.084V205.617H979.951V190.8H994.567V160.661Z"
      fill="currentColor"
    />
  </svg>
)
